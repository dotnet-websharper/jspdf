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
open WebSharper.JQuery
open WebSharper.UI
open WebSharper.UI.Client
open WebSharper.UI.Html
open WebSharper.UI.Templating

[<JavaScript>]
module Client =
    type IndexTemplate = Template<"index.html", ClientLoad.FromDocument>

    [<SPAEntryPoint>]
    let Main () =

        let doc = new JsPDF()

        doc.Text("Hello world!", 10., 10., obj) |> ignore
        doc.AddPage()
        doc.Text("Hello world on Page 2!", 10., 10., obj) |> ignore
        let pdf = doc.Output("bloburl", obj).ToString()

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
