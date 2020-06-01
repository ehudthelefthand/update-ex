package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type ImageJSON struct {
	Path string `json:"path"`
}

var db []string

func main() {
	r := gin.Default()
	r.Use(cors.Default())

	r.Static("/images", "./upload")

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "hello",
		})
	})

	r.GET("/photos", func(c *gin.Context) {
		images := []ImageJSON{}
		for _, img := range db {
			images = append(images, ImageJSON{
				Path: filepath.Join("images", img),
			})
		}
		c.JSON(200, images)
	})

	r.DELETE("/images/:filename", func(c *gin.Context) {
		filename := c.Param("filename")
		err := os.Remove(filepath.Join("upload", filename))
		// ใช้ os.RemoveAll("dirname")
		// ถ้าเราอยาก delete ทั้ง directory
		if err != nil {
			log.Println(err)
			c.Status(500)
			return
		}
		deleteFromDB(filename)
		c.Status(200)
	})

	r.POST("/upload", func(c *gin.Context) {
		err := os.MkdirAll("upload", os.ModePerm)
		if err != nil {
			log.Println(err)
			c.Status(500)
			return
		}
		form, err := c.MultipartForm()
		if err != nil {
			c.Status(400)
			return
		}

		files := form.File["photos"]

		images := []ImageJSON{}
		for _, file := range files {
			dst := filepath.Join("upload", file.Filename)
			err := c.SaveUploadedFile(file, dst)
			if err != nil {
				log.Println(err)
				c.Status(500)
				return
			}
			db = append(db, file.Filename)
			images = append(images, ImageJSON{
				Path: filepath.Join("images", file.Filename),
			})
		}
		c.JSON(200, images)
	})

	r.Run()
}

func deleteFromDB(filename string) {
	newDB := []string{}
	for _, image := range db {
		if image != filename {
			newDB = append(newDB, image)
		}
	}
	db = newDB
}
