// $begin{copyright}
//
// This file is part of WebSharper
//
// Copyright (c) 2008-2018 IntelliFactory
//
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License.  You may
// obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied.  See the License for the specific language governing
// permissions and limitations under the License.
//
// $end{copyright}
namespace WebSharper.JsPDF.Sample

open WebSharper
open WebSharper.JavaScript
open WebSharper.JsPDF
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Html
open WebSharper.UI.Templating

[<JavaScript>]
module Client =
    type IndexTemplate = Template<"index.html", ClientLoad.FromDocument>
    let img = """ data:image/png;base64,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"""

    [<SPAEntryPoint>]
    let Main () =
        let opt = JsPDFOptions(
            Format = PdfFormat.Letter,
            Unit = Unit.Mm
        )
        
        let doc = JsPDF(opt)
        
        let withLogo (doc:JsPDF) =
            doc
                .AddImage(ImageOptions(img, x = 5., y = 5., width = 20, height = 20))
                .Text("WebSharper JsPDF Sample", 28., 17.)

        
        (doc |> withLogo)
            .Text("Hello world!", 10., 35.)
            .Text("Another one", 10., 42.)
            |> ignore
        doc
            .Text("Fillable fields example, check the print preview", 10., 50.) |> ignore
            
        doc
            .Text("Name: ", 10., 63.)
            .AddField(JsPDF.JsPDF.AcroForm.TextField(X = 28, Y = 56, Width = 60, Height = 10, FontSize = 12))
            |> ignore
        doc.AddField(
            let li = JsPDF.JsPDF.AcroForm.ListBox(
                X = 10, Y = 68,
                Width = 78, Height = 16
            )
            li.SetOptions([|"Text1";"Text2";"Text3";"Text4"|])
            li) |> ignore
        doc.AddPage() |> ignore
        
        (doc |> withLogo).Text("Hello world on Page 2!", 10., 35.) |> ignore
        
        printfn $"{doc.Canvas.Width}"
        let pdf = doc.OutputAsURL().ToString()
        let pdfRender =
            Doc.Element "object"
                [
                    attr.width "100%"
                    attr.height "100%"
                    attr.data pdf
                    attr.``type`` "application/pdf"
                ] []

        IndexTemplate.Main()
            .PDF(pdfRender)
            .Doc()
        |> Doc.RunById "main"
