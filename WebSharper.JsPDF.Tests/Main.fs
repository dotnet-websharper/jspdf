namespace WebSharper.JsPDF.Tests

open WebSharper
open WebSharper.Sitelets
open WebSharper.UI.Next

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

#if ZAFIR
    let RunTests() =
        Runner.RunTests [
            Tests
        ]
#endif

module Site =
    open WebSharper.UI.Next.Server
    open WebSharper.UI.Next.Html

    [<Website>]
    let Main =
        Application.SinglePage (fun ctx ->
            Content.Page(
                Title = "WebSharper.JsPDF Tests",
                Body = [
#if ZAFIR
                    client <@ Client.RunTests() @>
#else
                    WebSharper.Testing.Runner.Run [
                        System.Reflection.Assembly.GetExecutingAssembly()
                    ]
                    |> Doc.WebControl
#endif
                ]
            )
        )
