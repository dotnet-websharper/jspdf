namespace WebSharper.JsPDF.Tests

open WebSharper
open WebSharper.Sitelets
open WebSharper.UI

[<JavaScript>]
module Client =
    open WebSharper.JavaScript
    open WebSharper.Testing

    let Tests =
        TestCategory "General" {

            Test "Sanity check" {
                equalMsg (1 + 1) 2 "1 + 1 = 2"
            }

            Test "JsPDF constructor test" {
                notEqualMsg (JsPDF.JsPDF()) (JS.Undefined) "JsPDF() constructor"
            }

        }

    [<SPAEntryPoint>]
    let RunTests() =
        let e = Runner.RunTests [Tests]
        e.ReplaceInDom(JS.Document.QuerySelector "#body")
