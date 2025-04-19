import React, { useRef, useEffect, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const backgroundColor = useRef("#ffffff")
  const [elements, setElements] = useState([]);
  const [selected, setSelected] = useState(null);
  const draggingIndex = useRef(null)
  const movingOffset = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 650;

    ctx.fillStyle = backgroundColor.current;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawAllElements(ctx);
  }, [elements, selected]);

  const drawAllElements = (ctx) => {
    ctx.clearRect(0, 0, 1000, 650);
    ctx.fillStyle = backgroundColor.current;
    ctx.fillRect(0, 0, 1000, 650);

    elements.forEach((el) => {
      if(selected !== null && elements[selected] === el){
        ctx.fillStyle = el.color;
        ctx.strokeStyle = 'red';
        ctx.rect(el.x, el.type === "text"?(el.y - el.height) : el.y, el.width, el.height);
        ctx.stroke();
      }
      if (el.type === "rect") {
        ctx.fillStyle = el.color;
        ctx.fillRect(el.x, el.y, el.width, el.height);
      } else if (el.type === "text") {
        ctx.fillStyle = el.color;
        ctx.font = `${el.fontSize}px Arial`;
        ctx.fillText(el.text, el.x, el.y);
        el.width = ctx.measureText(el.text).width;
        el.height = ctx.measureText(el.text).fontBoundingBoxAscent;
      }
    });
  };

  const addRectangle = () => {
    const rect = {
      type: "rect",
      name: "Rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: "black",
    };
    setElements([...elements, rect]);
  };

  const addText = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = "24px Arial";
    const text = "Hello!";
  
    const textWidth = ctx.measureText(text).width;
    const textHeight = 24; // Approximate height based on font size
  
    const textElement = {
      type: "text",
      name: "Text",
      text,
      fontSize: 24, 
      x: 200,
      y: 200,
      color: "black",
      width: textWidth,
      height: textHeight,
    };
  
    setElements([...elements, textElement]);
  };

  const colorChange = (e) =>{
    const updated = [...elements];
    updated[selected].color = e.target.value;
    setElements(updated);
  }

  const textChange = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const updated = [...elements];
    updated[selected].text = e.target.value;
    updated[selected].width = ctx.measureText(e.target.value).width
    setElements(updated);
  }
  
  const textSizeChange = (e) => {
    const updated = [...elements];
    updated[selected].fontSize = parseInt(e.target.value);
    setElements(updated);
  }

  const backgroundColorChange = (e) =>{
    backgroundColor.current = e.target.value; 
    drawAllElements(canvasRef.current.getContext("2d"));
  }

  const heightChange = (e) => {
    const updated = [...elements];
    updated[selected].height = parseInt(e.target.value);
    setElements(updated);
  }

  const widthChange = (e) => {
    const updated = [...elements];
    updated[selected].width = parseInt(e.target.value);
    setElements(updated);
  }

  const onMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === "rect") {
        if ( x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
          draggingIndex.current = i;
          break;
        }
      } else if (el.type === "text") {
        const textTop = el.y - el.height; 
        if (x >= el.x && x <= el.x + el.width && y >= textTop && y <= textTop + el.height) {
          draggingIndex.current = i;
          break;
        }
      }
    }
    if(draggingIndex.current !== null){
      const picked = elements[draggingIndex.current];
      movingOffset.current = {x: ((x-(picked.x))), y:((y-(picked.y)))}
      const rest = elements.filter((_, idx) => idx !== draggingIndex.current);
      setElements([...rest, picked]);
      draggingIndex.current = elements.length-1;
      setSelected(draggingIndex.current)
    }else{
      setSelected(null);
    }
  };

  const onMouseMove = (e) => {
    if (draggingIndex.current === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updated = [...elements];
    const el = updated[draggingIndex.current];
    
    el.x = x - movingOffset.current.x
    el.y = y - movingOffset.current.y
    
    setElements([...updated]);
  };


  const onMouseUp = () => {
    draggingIndex.current = null;
    movingOffset.current = null;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'canvas_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={addRectangle}>Add Rectangle</button>
      <button onClick={addText}>Add Text</button>
      <br></br>
      <div style={{ display: "flex", marginTop: "10px"}}>
        <canvas
          ref={canvasRef}
          style={{ border: "1px solid black" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
        <span style={{ marginLeft: "20px", display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid black", width: "300px", padding: "5px", gap: "5px"}}>
          <p id="status" style={{fontSize: "1.5em"}}> {selected === null ? "Nothing selected!": `Selected: ${elements[selected].name}`}</p>
          {selected !== null && 
            (<div> 
              <p style={{display:"inline", fontSize: "1em"}}>Color: </p>
              <input 
                type="color"
                value={elements[selected].color}
                onChange = {colorChange} 
              /> 
              <br></br>
            </div>)
          }
          {selected !== null && elements[selected].type === "text" && 
            (<div>
              <input 
                type="text" 
                value={elements[selected].text}
                onChange = {textChange}
              />
              <br></br>
              <input 
                type="range" 
                min="5" 
                max="350" 
                value={elements[selected].fontSize}
                onChange={textSizeChange}
                />
            </div>)
          }
          {selected !== null && elements[selected].type === "rect" && 
            (<div>
              <p style={{display:"inline", fontSize: "1em"}}>Height: </p>
              <input 
                type="range"
                min = "25"
                max="650"
                value={elements[selected].height}
                onChange = {heightChange}
                style={{verticalAlign: "middle"}}/>
                <br></br>
                <p style={{display:"inline", fontSize: "1em"}}>Width:  </p>
                <input 
                type="range"
                min = "25"
                max="1000"
                value={elements[selected].width}
                onChange = {widthChange}
                style={{verticalAlign: "middle"}}/>
            </div>

          )}
          <div>
            <p style={{display:"inline", fontSize: "1em"}}>Background color: </p>
            <input 
              type="color"
              onChange={backgroundColorChange}
              />
            <br></br>
            <input type="button" onClick={download} value="Download Image!"/>
          </div>
          </span>
      </div>
    </div>
  );
}