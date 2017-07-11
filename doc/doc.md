# JsPDF

[JsPDF](https://parall.ax/products/jspdf) is a JavaScript tool to create our own PDF from JavaScript or from HTML elements.

## Creating JsPDF object

To create a JsPDF object we just have to call it's contructor.

```fsharp
let doc = new JsPDF()
```

After this we can use every function and method from the JsPDF API. The library works the same way as the original JavaScript library.

## Simple example

```fsharp
let doc = new JsPDF()

doc.Text("Hello world!", 10., 10., obj) |> ignore
doc.AddPage()
doc.Text("Hello world on Page 2!", 10., 10., obj) |> ignore
doc.Save("a4.pdf")
```