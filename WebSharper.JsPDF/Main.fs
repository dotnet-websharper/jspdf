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
namespace WebSharper.JsPDF.Extension

open WebSharper
open WebSharper.InterfaceGenerator

module Definition =

    let OrientationPattern =
        Pattern.EnumStrings "orientation" [
            "portrait"
            "landscape"
        ]

    let UnitPattern =
        Pattern.EnumStrings "unit" [
            "pt"
            "mm"
            "cm"
        ]

    let FormatPattern =
        Pattern.EnumStrings "format" [
            "a0"
            "a1"
            "a2"
            "a3"
            "a4"
            "a5"
            "a6"
            "a7"
            "a8"
            "a9"
            "a10"
            "b0"
            "b1"
            "b2"
            "b3"
            "b4"
            "b5"
            "b6"
            "b7"
            "b8"
            "b9"
            "b10"
            "c0"
            "c1"
            "c2"
            "c3"
            "c4"
            "c5"
            "c6"
            "c7"
            "c8"
            "c9"
            "c10"
            "dl"
            "letter"
            "government-letter"
            "legal"
            "junior-legal"
            "ledger"
            "tabloid"
            "credit-card"
        ]

    let HTMLOptionsPattern =
        Pattern.Config "HTMLOptions" {
            Required = []
            Optional = 
                [
                    "format", T<string>
                    "height", T<float>
                    "pagesplit", T<bool>
                    "rstz", T<bool>
                ]
        }

    let JsPDFClass =
        Class "jsPDF"
        |+> Static [
            Constructor ((OrientationPattern.Type * UnitPattern.Type * FormatPattern.Type) + (T<unit>))
        ]
        |+> Instance [
            // Members
            "addHTML" => T<JavaScript.Dom.Element> * T<float> * T<float> * HTMLOptionsPattern.Type * T<JavaScript.Function> ^-> T<unit>
            |> ObsoleteWithMessage "This is being replace with a vector-supporting API."

            "autoPrint" => T<unit> ^-> T<unit>

            // Methods
            "addMetadata" => T<string> * T<string> ^-> TSelf

            "addPage" => T<unit> ^-> T<unit>

            "addFont" => T<string> * T<string> * T<string> ^-> T<obj>

            "circle" => T<float>?x * T<float>?y * T<float>?r * T<string>?style ^-> TSelf

            "ellipse" => T<float>?x * T<float>?y * T<float>?rx * T<float>?ry * T<string>?style ^-> TSelf

            "getFontList" => T<unit> ^-> T<obj>

            "lines" => (!| !| T<float>) * T<float> * T<float> * T<float> * T<string> * T<bool> ^-> TSelf

            "lstext" => (T<string> + !| T<string>) * T<float> * T<float> * T<float> ^-> TSelf
            |> ObsoleteWithMessage "We'll be removing this function. It doesn't take character width into account."

            "output" => T<string> * T<obj> ^-> TSelf

            "rect" => T<float> * T<float> * T<float> * T<float> * T<string> ^-> TSelf

            "roundedRect" => T<float> * T<float> * T<float> * T<float> * T<float> * T<float> * T<string> ^-> TSelf

            "save" => T<string> ^-> TSelf

            "setDisplayMode" => (T<int> + T<string>) * T<string> * T<string> ^-> TSelf

            "setDrawColor" => (T<float> * T<float> * T<float> * T<float> ^-> TSelf) + (T<string> * T<string> * T<string> * T<string> ^-> TSelf)

            "setFillColor" => (T<float> * T<float> * T<float> * T<float> ^-> TSelf) + (T<string> * T<string> * T<string> * T<string> ^-> TSelf)

            "setFont" => T<string> * T<string> ^-> TSelf

            "setFontSite" => T<float> ^-> TSelf

            "setFontStyle" => T<string> ^-> TSelf

            "setLineCap" => T<string> + T<float> ^-> TSelf

            "setLineJoin" => T<string> + T<float> ^-> TSelf

            "setLineWidth" => T<float> ^-> TSelf

            "setPage" => T<int> ^-> TSelf

            "setProperties" => T<obj> ^-> TSelf

            "setTextColor" => T<float> * T<float> * T<float> ^-> TSelf

            "text" => (T<string> + !| T<string>) * T<float> * T<float> * T<obj> ^-> TSelf

            "triangle" => T<float> * T<float> * T<float> * T<float> * T<float> * T<float> * T<string> ^-> TSelf
        ]

    let Assembly =
        Assembly [
            Namespace "WebSharper.JsPDF.Resources" [
                Resource "Js" "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.debug.js"
                |> AssemblyWide
            ]
            Namespace "WebSharper.JsPDF" [
                JsPDFClass
                OrientationPattern
                UnitPattern
                FormatPattern
                HTMLOptionsPattern
            ]
        ]


[<Sealed>]
type Extension() =
    interface IExtension with
        member x.Assembly = Definition.Assembly

[<assembly: Extension(typeof<Extension>)>]
do ()
