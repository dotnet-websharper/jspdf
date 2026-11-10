// $begin{copyright}
//
// This file is part of WebSharper
//
// Copyright (c) 2008-2026 IntelliFactory
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

    // The template is the whole document, loaded from the DOM, so editing
    // index.html and refreshing the browser is enough.
    type IndexTemplate = Template<"index.html", ClientLoad.FromDocument>

    // A small inline logo (a 164x164 PNG) used by the AddImage demo.
    let logo =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAdUlEQVR42u3bQQ0AIAwEQdTUvyC8gAQS4NN2NkHAzbuMIUnSsRmxMr22w79CZB//jNAaoMr4awQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANwLuxb3Z8DPkcLDJUmF20n/eFsMlj0BAAAAAElFTkSuQmCC"

    // ---------------------------------------------------------------
    // State bound into the template
    // ---------------------------------------------------------------

    let status = Var.Create "Ready — the PDF is generated from the controls below."
    let pageCount = Var.Create "-"
    let fontInfo = Var.Create "-"
    let textInfo = Var.Create "-"
    let notice = Var.Create ""

    // Theme: light is the default; the choice is persisted in localStorage.
    // The storage key is shared with the bootstrap script in index.html.
    let themeStorageKey = "websharper-jspdf-theme"
    let theme = Var.Create "light"
    let themeLabel = Var.Create "🌙 Dark mode"

    // The current document and its preview URL.
    let mutable doc : option<JsPDF> = None
    let preview = Var.Create Doc.Empty

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    let applyTheme () =
        JS.Document.DocumentElement.SetAttribute("data-theme", theme.Value)
        themeLabel.Value <-
            if theme.Value = "dark" then "☀️ Light mode" else "🌙 Dark mode"

    let toggleTheme () =
        theme.Value <- (if theme.Value = "dark" then "light" else "dark")
        try JS.Window.LocalStorage.SetItem(themeStorageKey, theme.Value) with _ -> ()
        applyTheme ()

    let previewDoc (url: string) =
        Doc.Element "object"
            [
                attr.width "100%"
                attr.height "100%"
                // Ask the browser's PDF viewer to fit the page to the width.
                attr.data (url + "#view=FitH")
                attr.``type`` "application/pdf"
            ] []

    // Build a multi-page document that exercises the binding surface.
    let buildDocument () =
        let options = JsPDFOptions(Format = PdfFormat.Letter, Unit = Unit.Mm)
        let d = JsPDF(options)

        // Document metadata and viewer preferences.
        d.SetProperties(
            DocumentProperties(
                Title = "WebSharper.JsPDF sample",
                Subject = "jsPDF 4.x binding demo",
                Author = "WebSharper",
                Keywords = "WebSharper, F#, jsPDF, PDF",
                Creator = "WebSharper.JsPDF.Sample"
            )
        ) |> ignore
        d.SetDisplayMode("fullwidth") |> ignore

        // Page 1: logo, title and text.
        d.AddImage(ImageOptions(logo, x = 5., y = 5., width = 20, height = 20)) |> ignore
        d.SetFontSize(20.) |> ignore
        d.SetFont("helvetica", "bold") |> ignore
        d.Text("WebSharper.JsPDF", 28., 15.) |> ignore
        d.SetFontSize(11.) |> ignore
        d.SetFont("helvetica", "normal") |> ignore
        d.Text("jsPDF 4.x bindings for F# and C#", 28., 22.) |> ignore

        d.SetDrawColor("#4f46e5") |> ignore
        d.SetFillColor("#eef2ff") |> ignore
        d.SetLineWidth(0.6) |> ignore
        d.Rect(10., 30., 190., 22., "FD") |> ignore
        d.SetTextColor("#1e293b") |> ignore
        d.SetFontSize(12.) |> ignore
        d.Text("This PDF is generated entirely in the browser by the binding.", 14., 38.) |> ignore
        d.Text("It exercises text, images, shapes, form fields and outlines.", 14., 45.) |> ignore

        // Shapes.
        d.SetFillColor("#4f46e5") |> ignore
        d.Circle(30., 70., 10., "F") |> ignore
        d.SetFillColor("#0ea5e9") |> ignore
        d.Circle(55., 70., 10., "F") |> ignore
        d.SetDrawColor("#0f172a") |> ignore
        d.Line(75., 70., 120., 70.) |> ignore
        d.SetFillColor("#22c55e") |> ignore
        d.Rect(130., 60., 30., 20., "F") |> ignore

        // Wrapped text via splitTextToSize.
        let wrapped : string[] =
            d.SplitTextToSize(
                "splitTextToSize wraps a long paragraph to the given width, which is handy for flowing text across a page.",
                90,
                null
            )
        d.SetTextColor("#334155") |> ignore
        d.SetFontSize(10.) |> ignore
        d.Text(wrapped, 10., 90.) |> ignore

        // AcroForm fields.
        d.SetTextColor("#0f172a") |> ignore
        d.SetFontSize(11.) |> ignore
        d.Text("Name:", 10., 120.) |> ignore
        d.AddField(
            JsPDF.JsPDF.AcroForm.TextField(
                X = 28, Y = 113, Width = 70, Height = 9, FontSize = 11
            )
        ) |> ignore
        d.Text("Pick one:", 10., 135.) |> ignore
        let listBox =
            JsPDF.JsPDF.AcroForm.ListBox(X = 28, Y = 128, Width = 70, Height = 16)
        listBox.SetOptions([| "Text1"; "Text2"; "Text3"; "Text4" |])
        d.AddField(listBox) |> ignore

        // Outline entries (the `outline` plugin object).
        d.Outline.Add(null, "Introduction", OutlineOptions(1)) |> ignore

        // Page 2.
        d.AddPage() |> ignore
        d.SetFontSize(18.) |> ignore
        d.SetFont("helvetica", "bold") |> ignore
        d.SetTextColor("#0f172a") |> ignore
        d.Text("Page 2", 10., 20.) |> ignore
        d.SetFontSize(11.) |> ignore
        d.SetFont("helvetica", "normal") |> ignore
        d.Text("A second page, added with AddPage().", 10., 30.) |> ignore
        d.Outline.Add(null, "Second page", OutlineOptions(2)) |> ignore

        d

    let render () =
        let d = buildDocument ()
        doc <- Some d
        let url = d.OutputAsURL().ToString()
        preview.Value <- previewDoc url
        pageCount.Value <- string (int (d.GetNumberOfPages()))
        fontInfo.Value <- d.GetFont().FontName
        textInfo.Value <- string (int (d.GetTextWidth("WebSharper")))
        status.Value <- "PDF generated — use the preview or download it."

    let download () =
        match doc with
        | Some d ->
            d.Save("websharper-jspdf.pdf") |> ignore
            status.Value <- "Downloaded websharper-jspdf.pdf."
        | None -> status.Value <- "Generate the PDF first."

    let addPage () =
        match doc with
        | Some d ->
            d.AddPage() |> ignore
            let n = int (d.GetNumberOfPages())
            d.SetFontSize(18.) |> ignore
            d.SetFont("helvetica", "bold") |> ignore
            d.Text(sprintf "Page %d" n, 10., 20.) |> ignore
            d.SetFontSize(11.) |> ignore
            d.SetFont("helvetica", "normal") |> ignore
            d.Text("Added at runtime with AddPage().", 10., 30.) |> ignore
            let url = d.OutputAsURL().ToString()
            preview.Value <- previewDoc url
            pageCount.Value <- string n
            status.Value <- sprintf "Added page %d." n
        | None -> status.Value <- "Generate the PDF first."

    // ---------------------------------------------------------------
    // Entry point
    // ---------------------------------------------------------------

    [<SPAEntryPoint>]
    let Main () =
        // Restore a previously chosen theme (light is the default).
        let savedTheme =
            try JS.Window.LocalStorage.GetItem(themeStorageKey) with _ -> null
        if savedTheme = "dark" || savedTheme = "light" then
            theme.Value <- savedTheme
        applyTheme ()

        // `.Bind()` renders the whole document body, so the elements below are
        // in the DOM only after this call.
        IndexTemplate()
            .status(status.V)
            .pageCount(pageCount.V)
            .fontInfo(fontInfo.V)
            .textInfo(textInfo.V)
            .notice(notice.V)
            .themeLabel(themeLabel.V)
            .PDF(preview.V)
            .ToggleTheme(fun _ -> toggleTheme ())
            .Regenerate(fun _ -> render ())
            .Download(fun _ -> download ())
            .AddPage(fun _ -> addPage ())
            .Bind()

        // Generate the first document once the template is in the DOM.
        render ()
