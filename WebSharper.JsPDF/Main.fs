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
    
            
    let AnnotationType = Pattern.EnumStrings "AnnotationType" [
        "text"
        "freetext"
        "link"
    ]
    let Annotation =
        Class "Annotation"
        |+> Static [
            Constructor (
                AnnotationType
                * T<string>?title
                * T<string>?contents
                * (!?T<bool>?``open``)
                * (!?T<string>?name)
                * (!?T<float>?top)
                * (!?T<int>?pageNumber)
            )
        ]
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
        Pattern.EnumStrings "PdfFormat" [
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
    
    let GState =
        Class "GState"
        |+> Static [
            Constructor (
                !?T<float>?opacity
                * !?T<float>?``stroke-opacity``
                )
        ]
        |+> Instance [
            // "id" =@ T<string>
            // "objectNumber" =@ T<int>
            "opacity" =@ (!? T<float>)
            "stroke-opacity" =@ (!? T<float>)
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
        
    module Advanced =
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
                for c in 'a'..'f' do
                    c.ToString() =@ T<float>
                "sx" =@ T<float>
                "shy" =@ T<float>
                "shx" =@ T<float>
                "sy" =@ T<float>
                "tx" =@ T<float>
                "ty" =@ T<float>
                
                
                "rotation" =? T<float>
                "scaleX" =? T<float>
                "scaleY" =? T<float>
                "join" => (!? T<string>?separator) ^-> T<string>
                    |> WithComment "Join the Matrix values to a string"
                "multiply" => TSelf ^-> TSelf
                "decompose" => T<unit> ^-> DecomposedMatrix
                "toString" => T<unit> ^-> T<string>
                "inversed" => T<unit> ^-> TSelf
                "applyToPoint" => Point?pt ^-> Point
                "applyToRectangle" => Rectangle?rect ^-> Rectangle
                "clone" => T<unit> ^-> TSelf

            ]
        module Patterns =
            let JsPDFPattern =
                Class "JsPDFPattern"
                |+> Instance [
                    "gState" =? !? GState
                    "matrix" =? !? Matrix
                ]
            
            let ShadingPatternType = Pattern.EnumStrings "ShadingPatternType" [ "radial"; "axial" ]
            
            let AxialCoords =
                Class "AxialCoords"
                |+> Static [
                    Constructor (T<float>?x1 * T<float>?x2 * T<float>?x3 * T<float>?x4)
                    |> WithInline "[$x1,$x2,$x3,$x4]"
                ]
            let RadialCoords =
                Class "RadialCoords"
                |+> Static [
                    Constructor (T<float>?x1 * T<float>?y1 * T<float>?r * T<float>?x2 * T<float>?y2 * T<float>?r2)
                    |> WithInline "[$x1,$y1,$r,$x2,$y2,$r2]"
                ]
            let ShadingPatternStop =
                Class "ShadingPatternStop"
                |> WithSourceName "ShadingPatterStop"
                |+> Static [
                    Constructor ((T<byte>*T<byte>*T<byte>).Parameter.Type?color * T<float>?offset)
                ]
                |+> Instance [
                    "color" =? !|T<byte>
                    "offset" =? T<float>
                ]
                
            let ShadingPattern =
                Class "ShadingPattern"
                |=> Inherits JsPDFPattern
                |+> Static [
                    Constructor
                        (
                            ShadingPatternType?``type``
                            * (AxialCoords + RadialCoords)?coords
                            * Type.ArrayOf(ShadingPatternStop)?colors
                            * (!? GState?gState)
                            * (!? Matrix?matrix) 
                        )
                ]
            let TilingPattern =
                Class "TilingPattern"
                |=> Inherits JsPDFPattern
                |+> Static [
                    Constructor (
                        Type.ArrayOf(T<float>)?boundingBox
                        * T<float>?xStep
                        * T<float>?yStep
                        * (!? GState?gState)
                        * (!? Matrix?matrix)
                    )
                ]
                |+> Instance [
                    "boundingBox" =? Type.ArrayOf(T<float>)
                    "xStep" =? T<float>
                    "yStep" =? T<float>
                ]
            
            let typesToExport = [
                JsPDFPattern
                ShadingPatternType
                AxialCoords
                RadialCoords
                ShadingPatternStop
                ShadingPattern
                TilingPattern
            ]
        let typesToExport = [
            DecomposedMatrix
            Matrix
            for t in Patterns.typesToExport do
                t
        ]
    open Advanced
    
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
    
    let JsPDFEncoding = Pattern.EnumStrings "JsPDF.Encoding" [
        for n in ["Standard";"MacRoman";"WinAnsi"] do
            $"{n}Encoding"
        "Identity-H"
    ]
    
    let DisplayModeZoom = Pattern.EnumStrings "DisplayMode.Zoom" [
        "fullheight"; "fullwidth"; "fullpage"; "original"
    ]
    let DisplayModeLayout = Pattern.EnumStrings "DisplayMode.Layout" [
        "continuous"; "single"; "twoleft"; "tworight"; "two"
    ]
    let DisplayModePMode = Pattern.EnumStrings "DisplayMode.PMode" [
        "UseOutlines"; "UseThumbs"; "FullScreen"
    ]
    let PageInfo = Pattern.Config "PageInfo" {
        Required = [
            "objId", T<int>
            "pageNumber", T<int>
            "pageContext", T<obj>
        ]
        Optional = []
    }
    
    let DocumentProperties = Pattern.Config "DocumentProperties" {
        Required = []
        Optional = [
            for n in ["title";"subject";"author";"keywords";"creator"] do
                n, T<string>
        ]
    }
    
    let TextOptionsAlign = Pattern.EnumStrings "TextOptions.Align" [
        "left";"right";"center";"justify"
    ]
    
    let TextOptionsFlags = Pattern.Config "TextOptions.Flags" {
            Optional = []
            Required = [
                "noBOM", T<bool>
                "autoencode", T<bool>
            ]
    }
    
    let TextOptionsBaseline = Pattern.EnumStrings "TextOptions.Baseline" [
        "alphabetic";"ideographic";"bottom";"top";"middle";"hanging"
    ]
    
    let TextOptionsRenderingMode = Pattern.EnumStrings "TextOptions.RenderingMode" [
        "fill"
        "stroke"
        "fillThenStroke"
        "invisible"
        "fillAndAddForClipping"
        "strokeAndAddPathForClipping"
        "fillThenStrokeAndAddToPathForClipping"
        "addToPathForClipping"
    ]
    let TextOptionsLight = Pattern.Config "TextOptionsLight" {
        Required = []
        Optional = [
            "align", TextOptionsAlign.Type
            "angle", T<float> + Matrix.Type
            "baseline", TextOptionsBaseline.Type
            "flags", TextOptionsFlags.Type
            "rotationDirection", T<int>
            "charSpace", T<int>
            "horizontalScale", T<float>
            "lineHeightFactor", T<float>
            "maxWidth", T<float>
            "renderingMode", TextOptionsRenderingMode.Type
            for n in ["isInputVisual";"isOutputVisual";"isInputRtl";"isOutputRtl";"isSymmetricSwapping"] do
                n, T<bool>
        ] 
    }
    
    let TextOptions =
        Pattern.Config "TextOptions" {
            Required = [
                "text", T<string> + Type.ArrayOf T<string>
                "x", T<float>
                "y", T<float>
            ]
            Optional = []
        }
        |=> Inherits(TextOptionsLight)
    
    
    let outputMethods className t =
        [
            "outputAsBlob" => T<unit> ^-> T<JavaScript.Blob>
                            |> WithInline $"""{className}.output("blob")"""
                            
            "outputAsArrayBuffer" => T<unit> ^-> T<JavaScript.ArrayBuffer>
                            |> WithInline $"""{className}.output("arraybuffer")"""
                            
            "outputAsURL" => T<unit> ^-> T<JavaScript.URL>
                            |> WithInline $"""{className}.output("bloburl")"""
                            
            "outputAsURLString" => T<obj>?options ^-> T<string>
                                |> WithInline $"""{className}.output("dataurlstring", $options)"""
            
            "outputInNewWindow" => T<obj>?options ^-> T<JavaScript.Window>
                                |> WithInline $"""{className}.output("dataurlnewwindow", $options)"""
                                
            "outputAsBool" => T<obj>?options ^-> T<bool>
                            |> WithInline $"""{className}.output("dataurl", $options)"""
        ]
        |> List.map (fun x -> x :> CodeModel.IClassMember)
    let JsPDFClass =
        Class "jsPDF"
        |> ImportDefault "jspdf"
        |+> Static [
            Constructor JsPDFOptions.Type
            Constructor (
                (!?OrientationPattern?orientation)
                * (!?UnitPattern?unit)
                * (!?(T<string> + Type.ArrayOf T<int>)?format)
                * !?T<bool>?compressPdf
            )
            "version" =@ T<string>
            // "API" =? T<obj> // todo api
        ]
        |+> Instance [
            let Style = T<string>?style
            "compatAPI" => (TSelf ^-> T<unit>)?body ^-> T<unit>
            
            "advancedAPI" => (TSelf ^-> T<unit>)?body ^-> T<unit>
            
            "isAdvancedApi" => T<unit> ^-> T<bool>
            
            "addMetadata" => (T<string> * T<string>) ^-> TSelf

            "addPage" => (!? (T<string> + T<int>)?format) * (!? OrientationPattern)?orientation ^-> TSelf
            
            let addFontParams = T<string>?postScriptName
                                * T<string>?id
                                * T<string>?fontStyle
                                * !? (T<string> + T<double>)?fontWeight
                                * !? JsPDFEncoding?encoding
            "addFont" =>
                addFontParams
                ^-> T<string>
                
            "addFontFromURL" =>
                addFontParams
                * !? T<bool>?isStandardFont
                ^-> T<string>
            

            "addGState" => T<string>?key * GState?gState ^-> TSelf

            "addShadingPattern" => T<string>?key * Patterns.ShadingPattern?pattern ^-> TSelf
            "beginTilingPattern" => Patterns.TilingPattern?pattern ^-> T<unit>
            "endTilingPattern" => Patterns.TilingPattern?pattern ^-> T<unit>

            "beginFormObject" => (T<float>?x * T<float>?y *  T<float>?width * T<float>?height * Matrix?matrix) ^-> TSelf

            "circle" => (T<float>?x * T<float>?y * T<float>?r * Style)^-> TSelf
            
            "clip" => T<unit> ^-> TSelf

            "clipEvenOdd" => T<unit> ^-> TSelf

            "close" => T<unit> ^-> TSelf
            
            "stroke" => T<unit> ^-> TSelf

            "discardPath" => T<unit>
            
            "deletePage" => T<int>?targetPage ^-> TSelf

            "doFormObject" => T<string>?key * Matrix?matrix ^-> TSelf

            "ellipse" => T<float>?x * T<float>?y * T<float>?rx * T<float>?ry * (!?Style) ^-> TSelf

            "endFormObject" => T<string>?key ^-> TSelf
            
            "f2" => T<int>?number ^-> T<string>
            
            "f3" => T<int>?number ^-> T<string>
            
            // fillEvenOdd, fillStroke, fillStrokeEvenOdd
            for fill in ["";"EvenOdd";"Stroke";"StrokeEvenOdd"] do
                $"fill{fill}" => Patterns.JsPDFPattern?pattern ^-> TSelf
            
            // moveTo, lineTo
            for n in [|"move";"line"|] do
                $"{n}To" => T<float>?x * T<float>?y ^-> TSelf
            
            "curveTo" => T<float>?x1 * T<float>?y1 * T<float>?x2 * T<float>?y2 * T<float>?x3 * T<float>?y3 ^-> TSelf
            
            "getCharSpace" => T<unit> ^-> T<int>

            "getCreationDate" => T<string>?``type`` ^-> T<JavaScript.Date>
            
            "getCurrentPageInfo" => T<unit> ^-> PageInfo

            "getDrawColor" => T<unit> ^-> T<string>

            "getFileId" => T<unit> ^-> T<string>
            
            "getFillColor" => T<unit> ^-> T<string>
            
            "getFont" => T<unit> ^-> T<string>

            "getFontList" => T<unit> ^-> T<System.Collections.Generic.Dictionary<string,string>>

            "getFontSize" => T<unit> ^-> T<double>
            
            "getFormObject" => T<obj>?key ^-> T<obj>
            
            "getLineHeight" => T<unit> ^-> T<double>
            
            "getLineHeightFactor" => T<unit> ^-> T<double>
            
            "getLineWidth" => T<unit> ^-> T<double>
            
            "getNumberOfPages" => T<unit> ^-> T<double>
            
            "getPageInfo" => T<int>?pageNumberOneBased ^-> PageInfo
            
            "getR2L" => T<unit> ^-> T<bool>
            
            "getStyle" => Style ^-> T<string>
            
            "getTextColor" => T<unit> ^-> T<string>
            
            "insertPage" => T<int>?beforePage ^-> TSelf
            
            "line" => T<float>?x1 * T<float>?y1 * T<float>?x2 * T<float>?y2 * (!?Style) ^-> TSelf
            
            "lines" => (!| !| T<float>) * T<float> * T<float> * T<float> * T<string> * T<bool> ^-> TSelf

            "movePage" => T<int>?targetPage * T<int>?beforePage ^-> TSelf
            
            yield! (outputMethods "$this" TSelf)
            
            "output" => T<unit> ^-> TSelf
            // "outputAsBlob" => T<unit> ^-> T<JavaScript.Blob>
            //                 |> WithInline """$this.output("blob")"""
            //                 
            // "outputAsArrayBuffer" => T<unit> ^-> T<JavaScript.ArrayBuffer>
            //                 |> WithInline """$this.output("arraybuffer")"""
            //                 
            // "outputAsURL" => T<unit> ^-> T<JavaScript.URL>
            //                 |> WithInline """$this.output("bloburl")"""
            //                 
            // "outputAsURLString" => T<obj>?options ^-> T<string>
            //                     |> WithInline """$this.output("dataurlstring", $options)"""
            //
            // "outputInNewWindow" => T<obj>?options ^-> T<JavaScript.Window>
            //                     |> WithInline """$this.output("dataurlnewwindow", $options)"""
            //                     
            // "outputAsBool" => T<obj>?options ^-> T<bool>
            //                 |> WithInline """$this.output("dataurl", $options)"""
                            
            "pdfEscape" => T<string>?text * T<obj>?flags ^-> T<string>
            
            
            "path" => Type.ArrayOf(T<obj>)?lines * (!?Style) ^-> TSelf

            "rect" => T<float>?x * T<float>?y * T<float>?w * T<float>?h * Style ^-> TSelf

            "roundedRect" => T<float>?x * T<float>?y * T<float>?w * T<float>?h * T<float>?rx * T<float>?ry * Style ^-> TSelf
            
            "restoreGraphicsState" => T<unit> ^-> TSelf
            
            
            
            "save" => T<string> ^-> TSelf
            "savePromise" => T<string> ^-> T<JavaScript.Promise<_>>[TSelf]
            |> WithInline "$this.save($x, { returnPromise: true })"

            "saveGraphicsState" => T<unit> ^-> TSelf

            "setCharSpace" => T<float>?charSpace ^-> TSelf

            "setCreationDate" => (T<JavaScript.Date> + T<string>)?date ^-> TSelf

            "setCurrentTransformationMatrix" => Matrix?matrix ^-> TSelf

            "setDisplayMode" => (T<int> + T<string> + DisplayModeZoom)?zoom
                                    * (!?(T<string> + DisplayModeLayout)?layout)
                                    * (!?DisplayModePMode?pmode)
                                ^-> TSelf

            "setDocumentProperties" => DocumentProperties?properties ^-> TSelf

            "setProperties" => DocumentProperties?properties ^-> TSelf

            "setDrawColor" => T<string> + T<int> + (T<int> * T<int> * T<int> * T<int>) ^-> TSelf

            "setFillColor" => T<string> + (T<int> * T<int> * T<int> * T<int>) ^-> TSelf
            
            "setFileId" => T<string>?value ^-> TSelf

            "setFont" => T<string>?fontName * (!?T<string>)?fontStyle * (T<string> + T<float>)?fontWeight ^-> TSelf

            "setFontSize" => T<float> ^-> TSelf

            "setLineCap" => T<string> + T<float> ^-> TSelf
            
            "setLineDashPattern" => Type.ArrayOf(T<float>)?dashArray * T<int>?dashPhase ^-> TSelf
            
            "setLineHeightFactor" => T<float> ^-> TSelf
            
            "setLineJoin" => T<string> + T<float> ^-> TSelf
            
            "setLineMiterLimit" => T<float> ^-> TSelf
            
            "setLineWidth" => T<float> ^-> TSelf

            "setPage" => T<int>?page ^-> TSelf

            "setR2L" => T<bool>?value ^-> TSelf

            "setTextColor" => T<float>?ch1 * T<float>?ch2 * T<float>?ch3 * (!?T<float>?ch4) ^-> TSelf

            "text" => (T<string> + !| T<string>)?text * T<float>?x * T<float>?y * (!?TextOptionsLight?options) * (!?(T<float> + T<obj>))?transform ^-> TSelf

            "triangle" => T<float>?x1 * T<float>?x2 * T<float>?x3 * T<float>?y1 * T<float>?y2 * T<float>?y3 * (!? Style) ^-> TSelf

            // getHorizontalCoordinateString, getVerticalCoordinateString
            for n in [|"Horizontal";"Vertical"|] do
                $"get{n}CoordinateString" => T<float>?value ^-> T<float>
        ]

    module Plugins =
        module AutoPrint =
            let AutoPrintInput = Pattern.EnumStrings "AutoPrintInput" ["non-conform";"javascript"]
            
            let typesToExport = [AutoPrintInput]
        
        module Html =
            let Html2CanvasOptions = Pattern.Config "Html2CanvasOptions" {
                Required = []
                Optional = [
                    "async", T<bool>
                    "allowTaint", T<bool>
                    "backgroundColor", !? T<string>
                    "canvas", T<obj>
                    "foreignObjectRendering", T<bool>
                    "ignoreElements", T<JavaScript.HTMLElement> ^-> T<bool>
                    "imageTimeout", T<int>
                    "letterRendering", T<bool>
                    "logging", T<bool>
                    // "onclone", T<JavaScript.HTMLElement> ^-> T<unit> // TODO: HTMLDocument
                    "proxy", T<string>
                    "removeContainer", T<bool>
                    "scale", T<float>
                    "svgRendering", T<bool>
                    "taintTest", T<bool>
                    "useCORS", T<bool>
                    for n in [
                        "width";"height"
                        "x";"y"
                        "scrollX";"scrollY"
                        "windowWidth";"windowHeight"
                    ] do
                        n, T<int>
                ]
            }
            
            let HTMLWorkerProgress =
                Class "HTMLWorkerProgress"
                |=> Inherits T<JavaScript.Promise<obj>>
                |+> Instance [
                    "val" =? T<float>
                    "n" =? T<int>
                    "ratio" =? T<float>
                    "state" =? T<obj>
                    "stack" =? Type.ArrayOf T<JavaScript.Function>
                ]
                
            let HTMLOptionImageType = Pattern.EnumStrings "HTMLOptionImageType" [
                "jpeg";"png";"webp"
            ]
            
            let HTMLOptionImage = Pattern.Config "HTMLOptionImage" {
                Required = [
                    "type", HTMLOptionImageType.Type
                    "quality", T<float>
                ]
                Optional = []
            }
            
            let HTMLFontFaceStyle = Pattern.EnumStrings "HTMLFontFaceStyle" [
                "italic";"oblique";"normal"
            ]
            
            let HTMLFontFaceStretch = Pattern.EnumStrings "HTMLFontFaceStretch" [
                let withPrefixes pf = ["ultra-";"extra-";"";"semi-"] |> List.map (fun n -> $"{n}{pf}")
                
                yield! withPrefixes "condensed"
                "normal"
                yield! withPrefixes "expanded"
            ]
            
            let HTMLFontFaceWeight = Pattern.EnumStrings "HTMLFontWeight" [
                "normal";"bold"
                for i=1 to 9 do
                    $"%i{i*100}"
            ]
            
            let HTMLFontFaceFormat = Pattern.EnumStrings "HTMLFontFace.Format" [
                "truetype"
            ]
            let HTMLFontFaceSource =
                Pattern.Config "HTMLFontFaceSource" {
                    Optional = []
                    Required = [
                        "url", T<string>
                        "format", HTMLFontFaceFormat.Type
                    ] 
                }
            
            let HTMLFontFace = Pattern.Config "HTMLFontFace" {
                Required = ["family", T<string>]
                Optional = [
                    "style", HTMLFontFaceStyle.Type
                    "stretch", HTMLFontFaceStretch.Type
                    "weight", HTMLFontFaceWeight.Type
                    "src", Type.ArrayOf HTMLFontFaceSource.Type
                ]
            }
            
            let HTMLOptions = Pattern.Config "HTMLOptions" {
                Required = []
                Optional = [
                    "callback", JsPDFClass.Type?doc ^-> T<unit>
                    "margin", T<int> + Type.ArrayOf T<int>
                    "autoPaging", T<bool> + T<string>
                    "filename", T<string>
                    "image", HTMLOptionImage.Type
                    "html2canvas", Html2CanvasOptions.Type
                    "jsPDF", JsPDFClass.Type
                    for n in ["x";"y";"width";"windowWidth"] do
                        n, T<int>
                    "fontFaces", Type.ArrayOf HTMLFontFace.Type
                ]
            }
                
            let HTMLWorkerType =
                Pattern.EnumStrings "HTMLWorkerType" [
                    "container";"canvas";"img";"pdf";"context2d"
                ]
            let HTMLWorkerOutputImgType =
                Pattern.EnumStrings "HTMLWorkerOutputImgType" [
                    "img" ; "datauristring" ; "dataurlstring" ; "datauri" ; "dataurl"
                ]
            let HTMLWorker =
                Class "HTMLWorker"
                |=> Inherits T<JavaScript.Promise<obj>>
                |+> Instance [
                    "from" => (T<JavaScript.HTMLElement> + T<string>)?src * HTMLWorkerType.Type?``type`` ^-> TSelf
                    "progress" =? HTMLWorkerProgress
                    "error" => T<string>?msg ^-> T<unit>
                    "save" => T<string>?filename ^-> T<JavaScript.Promise<unit>>
                    "set" => HTMLOptions?opt ^-> TSelf
                    "get" => T<string>?key * (T<string>?value ^-> T<unit>)?cbk ^-> TSelf
                    "doCallback" => T<unit> ^-> T<JavaScript.Promise<unit>>
                    "outputImage" => HTMLWorkerOutputImgType.Type?``type`` ^-> T<JavaScript.Promise<unit>>
                    yield! outputMethods "jsPDF" JsPDFClass
                    "outputPdf" =? (T<unit> ^-> JsPDFClass) |> WithGetterInline """jsPDF["output"]"""
                ]
            let methodsToApply = [
                "html" => (T<string> + T<JavaScript.HTMLElement>)?src * (!? HTMLOptions)?options ^-> HTMLWorker
            ]
            let typesToExport = [
                Html2CanvasOptions
                HTMLWorkerProgress
                HTMLOptionImageType
                HTMLOptionImage
                HTMLFontFaceStyle
                HTMLFontFaceStretch
                HTMLFontFaceWeight
                HTMLFontFaceFormat
                HTMLFontFaceSource
                HTMLFontFace
                HTMLOptions
                HTMLWorkerType
                HTMLWorkerOutputImgType
                HTMLWorker
            ]
            
        let typesToExport = [
            for t in Html.typesToExport do t
            for t in AutoPrint.typesToExport do t
        ]
        let methodsToApply =
            [
                for m in Html.methodsToApply do m
            ]
    
    JsPDFClass
    |+> Instance [
        for m in Plugins.methodsToApply do m
    ]
    |> ignore
    
    let Assembly =
        Assembly [
            Namespace "WebSharper.JsPDF.Resources" [
                //Resource "Js" "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.2/jspdf.debug.js"
                //|> AssemblyWide
            ]
            Namespace "WebSharper.JsPDF" [
                AnnotationType
                Annotation
                OrientationPattern
                UnitPattern
                FormatPattern
                GState
                Point
                Rectangle
                FloatPrecision
                PdfEncryption
                JsPDFOptions
                JsPDFEncoding
                DisplayModeZoom
                DisplayModeLayout
                DisplayModePMode
                PageInfo
                DocumentProperties
                TextOptionsAlign
                TextOptionsFlags
                TextOptionsBaseline
                TextOptionsRenderingMode
                TextOptionsLight
                TextOptions
                JsPDFClass
                
                for t in Advanced.typesToExport do t
                
                for t in Plugins.typesToExport do
                    t
            ]
        ]
        
        

[<Sealed>]
type Extension() =
    interface IExtension with
        member x.Assembly = Definition.Assembly

[<assembly: Extension(typeof<Extension>)>]
do ()
