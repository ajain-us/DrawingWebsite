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
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.angle);
      if(selected !== null && elements[selected] === el){
        ctx.fillStyle = el.color;
        ctx.strokeStyle = 'red';
        ctx.rect(0, el.type === "text"?(0 - el.height) : 0, el.width, el.height);
        ctx.stroke();
      }
      ctx.fillStyle = el.color;
      if (el.type === "rect") {
        ctx.fillRect(0, 0, el.width, el.height);
      } else if (el.type === "text") {
        ctx.font = `${el.fontSize}px Arial`;
        ctx.fillText(el.text, 0, 0);
        el.width = ctx.measureText(el.text).width;
        el.height = ctx.measureText(el.text).fontBoundingBoxAscent;
      }
      ctx.restore();
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
      angle: 0,
    };
    setElements([...elements, rect]);
  };

  const addText = () => {  
    const textElement = {
      type: "text",
      name: "Text",
      text: "Edit Here",
      fontSize: 24, 
      x: 200,
      y: 200,
      color: "black",
      width: 0,
      height: 0,
      angle: 0,
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

  const angleChange = (e) =>{
    const updated = [...elements];
    updated[selected].angle = parseInt(e.target.value) * Math.PI / 180;
    setElements(updated);
  }

  const onMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    
  
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const dx = e.clientX - rect.left - el.x;
      const dy = e.clientY - rect.top - el.y;
      const x = dx * Math.cos(-el.angle) - dy * Math.sin(-el.angle) + el.x;
      const y = dx * Math.sin(-el.angle) + dy * Math.cos(-el.angle) + el.y;
      if (el.type === "rect") {
        if ( x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
          movingOffset.current = {x: ((x-(el.x))), y:((y-(el.y)))};
          draggingIndex.current = i;
          break;
        }
      } else if (el.type === "text") {
        const textTop = el.y - el.height; 
        if (x >= el.x && x <= el.x + el.width && y >= textTop && y <= textTop + el.height) {
          movingOffset.current = {x: ((x-(el.x))), y:((y-(el.y)))};
          draggingIndex.current = i;
          break;
        }
      }
    }
    if(draggingIndex.current !== null){
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

    const offsetX = movingOffset.current.x * Math.cos(el.angle) - movingOffset.current.y * Math.sin(el.angle);
    const offsetY = movingOffset.current.x * Math.sin(el.angle) + movingOffset.current.y * Math.cos(el.angle);

    
    el.x = x - offsetX;
    el.y = y - offsetY;
    
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

  const sendBack = () =>{
    if(selected === 0){
      return;
    }
    const updated = [...elements];
    const temp =  updated[selected];
    updated[selected] = updated[selected-1];
    updated[selected-1] = temp;
    setElements(updated);
    setSelected(selected-1)
  }

  const bringForwrd = () =>{
    if(selected === (elements.length -1)){
      return;
    }
    const updated = [...elements];
    const temp = updated[selected];
    updated[selected] = updated[selected+1];
    updated[selected+1] = temp;
    setElements(updated);
    setSelected(selected+1)
  }

  const deleteSelected = () =>{
    const updated = [...elements];
    updated.splice(selected, 1);
    setElements(updated);
    setSelected(null);
  }

  return (
    <div>
      <button onClick={addRectangle}>Add Rectangle</button>
      <button onClick={addText}>Add Text</button>
      <br></br>
      <div class="canvasDiv">
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
        <span>
          <p id="status"> {selected === null ? "Nothing selected!": `Selected: ${elements[selected].name}`}</p>
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
              <p>Height: </p>
              <input 
                type="range"
                min = "1"
                max="650"
                value={elements[selected].height}
                onChange = {heightChange}
                />
                <br></br>
                <p>Width:  </p>
                <input 
                type="range"
                min = "1"
                max="1000"
                value={elements[selected].width}
                onChange = {widthChange}
                />
            </div>

          )}
          {selected !== null && (
            <div>
              <input type="button" onClick={sendBack} value="Send Back"/>
              <input type="button" onClick={bringForwrd} value="Bring Forward"/>
              <br></br>
              <input type="button" onClick={deleteSelected} value="Delete Element"/>
              <br></br>
              <input 
                type="range"
                min = "0"
                max={"360"}
                value={elements[selected].angle * 180 / Math.PI}
                onChange = {angleChange}
              />  
            </div>
          )}
          <div>
            <p>Background color: </p>
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