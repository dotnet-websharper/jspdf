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
    let FloatPrecision = 
        Pattern.EnumStrings "FloatPrecision" ["smart"]
    let PdfEncryption = Pattern.Config "PdfEncryption" {
        Required = []
        Optional = [
            "userPassword", T<string>
            "ownerPassword", T<string>
            "userPermissions", !| T<string>
        ]
    }
    let JsPDFOptions = 
        Pattern.Config "JsPDFOptions" {
        Required = []
        Optional = [
            "orientation", OrientationPattern.Type
            "unit", UnitPattern.Type
            "format", FormatPattern.Type + !| FormatPattern.Type
            "putOnlyUsedFonts", T<bool>
            "compress", T<bool>
            "precision", T<int>
            "userUnit", T<double>
            "hotfixes", !| T<string>
            "encryption", PdfEncryption.Type
            "floatPrecision", T<double> + FloatPrecision

        ]
    }
    
    let GState =
        Class "GState"
        |+> Instance [
            "id" =@ T<string>
            "objectNumber" =@ T<int>
            "opacity" =@ T<obj>
            "stroke-opacity" =@ T<obj>
        ]
    let Point =
        Class "Point"
        |+> Static [
            Constructor (T<float>?x * T<float>?y)
        ]
        |+> Instance [
            "x" =@ T<float>
            "y" =@ T<float>
        ]
    let Rectangle =
        Class "Rectangle"
        |+> Static [ 
            Constructor (T<float>?x * T<float>?y * T<float>?w * T<float>?h) 
        ]
        |+> Instance [
            "w" =? T<float>
            "h" =? T<float>
        ]

    let DecomposedMatrix =
        Class "Matrix.Decomposed"
        |+> Instance [
            "scale" =? T<float>
            "translate" =? T<float>
            "rotate" =? T<float>
            "skew" =? T<float>
        ]

    let Matrix =
        Class "Matrix"
        |+> Static [
            Constructor 
                <| T<float>?sx * T<float>?shy * T<float>?shx * T<float>?sy * T<float>?tx * T<float>?ty
        ]
        |+> Instance [
            "isIdentity" =? T<bool>
            "sx" =@ T<float>
            "shy" =@ T<float>
            "sy" =@ T<float>
            "tx" =@ T<float>
            "ty" =@ T<float>
            for c = 'a' to 'f' do
                c.ToString() =@ T<float>
            
            "rotation" =? T<float>
            "scaleX" =? T<float>
            "scaleY" =? T<float>
            "join" => T<string>?separator ^-> T<string>
                |> WithComment "Join the Matrix values to a string"
            "multiply" => TSelf ^-> TSelf
            "decompose" => T<unit> ^-> DecomposedMatrix // TODO scale,translate,rotate,skew object
            "toString" => T<unit> ^-> T<obj>
            "inversed" => T<unit> ^-> TSelf
            "applyToPoint" => Point?pt ^-> Point // TODO point
            "applyToRectangle" => Rectangle?rect ^-> Rectangle

        ]

    let JsPDFClass =
        Class "jsPDF"
        |> ImportDefault "jspdf"
        |+> Static [
            Constructor (JsPDFOptions.Type + (T<unit>))

            "version" =@ T<string>
        ]
        |+> Instance [
            // Members

            "addHTML" => T<JavaScript.Dom.Element> * T<float> * T<float> * HTMLOptionsPattern.Type * T<JavaScript.Function> ^-> T<unit>
            |> ObsoleteWithMessage "This is being replace with a vector-supporting API."

            "autoPrint" => T<unit> ^-> T<unit>

            // Methods
            "addMetadata" => (T<string> * T<string>) ^-> TSelf

            "addPage" => T<unit> ^-> T<unit>

            "addFont" => T<string>?postScriptName * T<string>?id * T<string>?fontStyle * (T<string> + T<double>)?fontWeight * T<obj>?encoding ^-> T<obj>

            "addGState" => T<string>?key * GState?gState ^-> TSelf

            //"addPattern" => T<string>?key * T<obj>?pattern ^-> TSelf // TODO Pattern


            //"beginFormObject" => (T<float>?x * T<float>?y *  T<float>?width * T<float>?height * Matrix?matrix) ^-> TSelf

            "circle" => (T<float>?x * T<float>?y * T<float>?r * T<string>?style)^-> TSelf
            
            "clip" => (T<string>?rule)^-> TSelf
            |> WithComment "Only possible rule value is 'evenodd'"

            "clipEvenOdd" => T<unit> ^-> TSelf

            "close" => T<unit>
            "comment" => T<string>?text^-> TSelf
            
            "curveTo" => T<float>?x1 * T<float>?y1 * T<float>?x2 * T<float>?y2 * T<float>?x3 * T<float>?y3 ^-> TSelf

            "deletePage" => T<int>?targetPage ^-> TSelf

            "discardPath" => T<unit>

            //"doFormObject" => T<string>?key * Matrix?matrix ^-> TSelf

            "ellipse" => T<float>?x * T<float>?y * T<float>?rx * T<float>?ry * T<string>?style ^-> TSelf

            //"endFormObject" => T<string>?key ^-> TSelf

            //for fill in ["";"EvenOdd";"Stroke";"StrokeEvenOdd"] do
            //    $"fill{fill}" => T<obj>?pattern ^-> TSelf // TODO Pattern
            
            "getCharSpace" => T<unit> ^-> T<int>

            "getCreationDate" => T<obj>?``type`` ^-> T<obj>

            "getDrawColor" => T<obj> ^-> T<string>

            let inline MultOf n t =
                let mutable curr = t
                for i = 1 to n do
                    curr <- curr * t
                curr

            "getFontList" => T<unit> ^-> T<obj>

            "lines" => (!| !| T<float>) * T<float> * T<float> * T<float> * T<string> * T<bool> ^-> TSelf

            "lstext" => (T<string> + !| T<string>) * T<float> * T<float> * T<float> ^-> TSelf
            |> ObsoleteWithMessage "We'll be removing this function. It doesn't take character width into account."

            "output" => T<string> * T<obj> ^-> TSelf

            "rect" => T<float> * T<float> * T<float> * T<float> * T<string> ^-> TSelf

            "roundedRect" => T<float> * T<float> * T<float> * T<float> * T<float> * T<float> * T<string> ^-> TSelf

            "save" => T<string> ^-> TSelf
            "savePromise" => T<string> ^-> T<JavaScript.Promise<_>>[TSelf] 
            |> WithInline "save($x, { returnPromise: true })" // TODO check if this is valid

            "saveGraphicsState" => T<unit> ^-> TSelf

            "setCharSpace" => T<float>?charSpace ^-> TSelf

            "setCreationDate" => T<obj>?date ^-> TSelf

            //"setCurrentTransformationMatrix" => Matrix?matrix ^-> TSelf

            "setDisplayMode" => (T<int> + T<string>)?zoom * T<string>?layout * T<string>?pmode ^-> TSelf

            "setDocumentProperties" => T<obj>?a ^-> TSelf

            "setDrawColor" => (T<float> * T<float> * T<float> * T<float>) + (T<string> * T<string> * T<string> * T<string>) ^-> TSelf

            "setFillColor" => (T<float> * T<float> * T<float> * T<float>) + (T<string> * T<string> * T<string> * T<string>) ^-> TSelf

            "setFont" => T<string> * T<string> ^-> TSelf

            "setFontSite" => T<float> ^-> TSelf

            "setFontStyle" => T<string> ^-> TSelf

            "setLineCap" => T<string> + T<float> ^-> TSelf

            "setLineJoin" => T<string> + T<float> ^-> TSelf

            "setLineWidth" => T<float> ^-> TSelf

            "setPage" => T<int>?page ^-> TSelf

            "setPrecision" => T<string>?precision ^-> TSelf

            "setProperties" => T<obj> ^-> TSelf

            "setR2L" => T<bool>?value ^-> TSelf

            "setTextColor" => T<float>?ch1 * T<float>?ch2 * T<float>?ch3 * T<float>?ch4 ^-> TSelf

            "stroke" => T<unit> ^-> TSelf

            "text" => (T<string> + !| T<string>)?text * T<float>?x * T<float>?y * T<obj>?options ^-> TSelf

            "triangle" => T<float>?x1 * T<float>?x2 * T<float>?x3 * T<float>?y1 * T<float>?y2 * T<float>?y3 * (!? T<string>?style) ^-> TSelf


        ]

    let Assembly =
        Assembly [
            Namespace "WebSharper.JsPDF.Resources" [
                //Resource "Js" "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.debug.js"
                //|> AssemblyWide
            ]
            Namespace "WebSharper.JsPDF" [
                GState
                Point
                Rectangle
                DecomposedMatrix
                Matrix

                FloatPrecision
                PdfEncryption
                JsPDFOptions
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
