# WebSharper.JsPDF

[![NuGet](https://img.shields.io/nuget/v/WebSharper.JsPDF.svg)](https://www.nuget.org/packages/WebSharper.JsPDF)

WebSharper bindings for [jsPDF](https://github.com/parallax/jsPDF) 2.5.1+ — client-side PDF
generation for F# and C# web apps.

This repository contains:

| Project | Purpose |
|---|---|
| `WebSharper.JsPDF` | The binding: typed F#/C# wrappers for jsPDF. |
| `WebSharper.JsPDF.Sample` | A WebSharper SPA that builds a multi-page PDF (text, an image and AcroForm fields) and previews it. |
| `WebSharper.JsPDF.Tests` | WebSharper.Testing tests for the binding. |

## Live demos

- **Binding sample (this repo):** https://dotnet-websharper.github.io/jspdf/
- **Sample in the WebSharper samples gallery:** https://websharper-samples.github.io/JsPDF/
- **Sample source in the gallery:** https://github.com/websharper-samples/JsPDF
- **WebSharper:** https://websharper.com

## Install

```bash
dotnet add package WebSharper.JsPDF
```

Or with Paket:

```fsharp
nuget WebSharper.JsPDF
```

The package targets `netstandard2.0` and works with any WebSharper 10 project. jsPDF itself
is pulled from npm (`jspdf`), so the JS bundle step must resolve it (WebSharper's SPA/esbuild
build does this automatically).

## Usage

All types live in the `WebSharper.JsPDF` namespace.

### Build a document

```fsharp
open WebSharper
open WebSharper.JavaScript
open WebSharper.JsPDF

[<JavaScript>]
let CreatePdf () =
    let doc = JsPDF(JsPDFOptions(Format = PdfFormat.Letter, Unit = Unit.Mm))

    doc.Text("Hello, WebSharper!", 10., 20.) |> ignore
    doc.AddPage() |> ignore
    doc.Text("Page 2", 10., 20.) |> ignore

    doc.Save("document.pdf")
```

### Preview it

`OutputAsURL()` returns a `blob:` URL that you can point an `<object>`/`<iframe>` at:

```fsharp
let url = doc.OutputAsURL().ToString()
```

Other output helpers from the binding include `OutputAsBlob()`, `OutputAsArrayBuffer()` and
`OutputAsURLString()`.

### Images, tables and form fields

- `doc.AddImage(ImageOptions(dataUrl, x = 5., y = 5., width = 20, height = 20))`
- `doc.AddField(JsPDF.JsPDF.AcroForm.TextField(X = 10, Y = 10, Width = 60, Height = 10))`
- The binding also exposes the `jspdf-autotable` table and HTML-rendering plugins.

### Notes on the API

- The binding imports the npm package as `"jspdf"` (lowercase). This matters on
  case-sensitive file systems: the previous `"jsPDF"` specifier only resolved on
  case-insensitive systems (macOS) and broke bundling in CI/Linux.
- `OutputAsURL()`, `OutputAsBlob()` etc. map to jsPDF's `output("bloburl"|"blob"|...)` methods.

## Build from source

### Prerequisites

- .NET SDK 10 (or any SDK that can build `netstandard2.0`).
- [Node.js](https://nodejs.org/) (LTS) for the esbuild bundle step.
- [Paket](https://fsprojects.github.io/Paket/) as a local dotnet tool (configured in `.config/dotnet-tools.json`).

### Restore and build

```bash
dotnet tool restore
dotnet tool run paket restore
dotnet build WebSharper.JsPDF.sln -c Release
```

### Run the sample

The sample compiles to static assets in `dist`:

```bash
dotnet build WebSharper.JsPDF.Sample/WebSharper.JsPDF.Sample.fsproj -c Release
python3 -m http.server -d dist 8080
```

Then open <http://localhost:8080> (the PDF preview needs a browser with a built-in PDF viewer).

### Pack the NuGet package

After a Release build (so the assembly exists in `bin/Release/netstandard2.0`):

```bash
dotnet tool run paket pack ./out
```

### Deployment

Pushing to `master` triggers `.github/workflows/ghpages.yml`, which builds the sample in
Release and publishes `dist` to the `gh-pages` branch via GitHub Pages.

## Repository layout

```
WebSharper.JsPDF/                # the binding
  Main.fs                        # types + [<assembly: Extension>] registration
WebSharper.JsPDF.Sample/         # static SPA demo
  Client.fs
  index.html
  esbuild.config.mjs
WebSharper.JsPDF.Tests/          # WebSharper.Testing tests
nuget/                           # Paket pack template
.github/workflows/ghpages.yml    # build + deploy the sample to gh-pages
```

## License

Apache 2.0 — see [LICENSE.md](LICENSE.md).
