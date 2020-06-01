import React, { useEffect, useState } from "react";
import axios from "axios";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

function App() {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);

  const [antImages, setAntImages] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch();
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/photos")
      .then((res) => {
        setImages(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const files = e.target.elements["photos"].files;
    const form = new FormData();
    for (let i = 0; i < files.length; i++) {
      form.append("photos", files[i]);
    }
    axios
      .post("http://localhost:8080/upload", form)
      .then((res) => {
        setImages([...images, ...res.data]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="App">
      {message}
      <div style={{ margin: "100px" }}>
        <Upload
          multiple
          onChange={({ file, fileList, event }) => {
            console.log("file", file);
            console.log("fileList", fileList);
            console.log("event", event);
            setAntImages(fileList.map((f) => f.originFileObj));
          }}
        >
          <Button>
            <UploadOutlined /> Click to Upload
          </Button>
        </Upload>
        <Button
          onClick={() => {
            console.log(antImages);
            const form = new FormData();
            for (let i = 0; i < antImages.length; i++) {
              form.append("photos", antImages[i]);
            }
            axios
              .post("http://localhost:8080/upload", form)
              .then((res) => {
                setImages(res.data);
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        >
          Upload Ant
        </Button>
      </div>
      <form
        method="POST"
        action="/upload"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >
        <input type="file" name="photos" multiple />
        <button type="submit">upload</button>
      </form>
      <div
        style={{ display: "flex", flexFlow: "column wrap", height: "500px" }}
      >
        {images.map((img, index) => (
          <div style={{ width: "20%" }} key={index}>
            <img
              src={`http://localhost:8080/${img.path}`}
              style={{ width: "100%" }}
            />
            <button
              onClick={() => {
                axios
                  .delete(`http://localhost:8080/${img.path}`)
                  .then(() => {
                    alert("success");
                    const filter = images.filter(
                      (image) => image.path !== img.path
                    );
                    setImages(filter);
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              }}
            >
              delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
