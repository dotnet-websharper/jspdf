namespace WebSharper.JsPDF.Extension

open WebSharper
open WebSharper.InterfaceGenerator

module Definition =

    let Assembly =
        Assembly [
            Namespace "WebSharper.JsPDF.Resources" [
            ]
            Namespace "WebSharper.JsPDF" [
            ]
        ]


[<Sealed>]
type Extension() =
    interface IExtension with
        member x.Assembly = Definition.Assembly

[<assembly: Extension(typeof<Extension>)>]
do ()
