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
    
    let TextOptionsAlign = Pattern.EnumStrings "TextOptionsAlign" [
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
        module AddImage =
            
            let imageDataTypes = T<string> + T<JavaScript.HTMLImageElement> + T<JavaScript.HTMLCanvasElement> + T<JavaScript.Uint8Array>
            
            let RGBAData = Pattern.Config "RGBAData" {
                Required = [
                    "data", T<JavaScript.Uint8ClampedArray>
                    "width", T<float>
                    "height", T<float>
                ]
                Optional = []
            }
            
            let ImageCompression = Pattern.EnumStrings "ImageCompression" [
                "NONE"
                "FAST"
                "MEDIUM"
                "SLOW"
            ]
            
            let ColorSpace = Pattern.EnumStrings "ColorSpace" [
                "DeviceRGB"
                "DeviceGray"
                "DeviceCMYK"
                "CalGray"
                "CalRGB"
                "Lab"
                "ICCBased"
                "Indexed"
                "Pattern"
                "Separation"
                "DeviceN"
            ]
            
            let ImageFormat = Pattern.EnumStrings "ImageFormat" [
                "RGBA"
                "UNKNOWN"
                "PNG"
                "TIFF"
                "JPG"
                "JPEG"
                "JPEG2000"
                "GIF87a"
                "GIF89a"
                "WEBP"
                "BMP"
            ]
            
            let ImageOptions = Pattern.Config "ImageOptions" {
                Required = [
                    "imageData", imageDataTypes+RGBAData.Type
                    "x", T<float>
                    "y", T<float>
                    "width", T<float>
                    "height", T<float>
                ]
                Optional = [
                    "alias", T<string>
                    "compression", ImageCompression.Type
                    "rotation", T<float>
                    "format", ImageFormat.Type
                ]
            }
            
            let ImageProperties = Pattern.Config "ImageProperties" {
                Required = [
                    "alias", T<float>
                    "width", T<float>
                    "height", T<float>
                    "colorSpace", ColorSpace.Type
                    "bitsPerComponent", T<int>
                    "filter", T<string>
                    "index", T<int>
                    "data", T<string>
                    "fileType", ImageFormat.Type
                ]
                Optional = [
                    "decodeParameters", T<string>
                    "transparency", T<obj>
                    "palette", T<obj>
                    "sMask", T<obj>
                    "predictor", T<float>
                    
                ]
            }
            
            let typesToExport = [
                RGBAData
                ImageCompression
                ColorSpace
                ImageFormat
                ImageOptions
                ImageProperties
            ]
            let methodsToApply = [
                "addImage" =>
                    (
                             (imageDataTypes+RGBAData.Type)?imageData
                             * T<string>?format
                             * T<float>?x * T<float>?y
                             * T<float>?w * T<float>?h
                             * (!? T<string>)?alias
                             * (!? ImageCompression.Type)?compression
                             * (!? T<float>)?rotation
                    ) ^-> JsPDFClass
                "addImage" => ImageOptions.Type?options ^-> JsPDFClass
                "getImageProperties" => imageDataTypes?imageData ^-> ImageProperties
            ]
        
        module Arabic =
            
            let methodsToApply = [
                "processArabic" => T<string>?text ^-> T<string>
            ]
            
        module Annotations =
            
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
                
            let typesToExport = [
                AnnotationType
                Annotation
            ]
            let methodsToApply = [
                "createAnnotation" => Annotation?options ^-> T<unit>
                "link" => T<float>?x * T<float>?y * T<float>?w * T<float>?h * T<obj>?options ^-> T<unit>
                "textWithLink" => T<string>?text * T<float>?x * T<float>?y * T<obj>?options ^-> T<int>
                "getTextWidth" => T<string>?text ^-> T<int>
            ]
            
        module AutoPrint =
            let AutoPrintInput = Pattern.EnumStrings "AutoPrintInput" ["non-conform";"javascript"]
            
            let typesToExport = [AutoPrintInput]
            let methodsToApply = [
                "autoPrint" => !?AutoPrintInput?options ^-> JsPDFClass
            ]
        
        module AcroForm =
            let TextAlign = Pattern.EnumStrings "TextAlign" [
                "left";"center";"right"
            ]
            
            let AcroFormAppearanceState = Pattern.EnumStrings "AcroFormAppearanceState" [
                "On";"Off"
            ]
            
            let AcroFormField =
                Class "AcroFormField"
                |+> Instance [
                    "showWhenPrinted" =@ T<bool>
                    "x" =@ T<float>
                    "y" =@ T<float>
                    "width" =@ T<float>
                    "height" =@ T<float>
                    "fieldName" =@ T<string>
                    "fontName" =@ T<string>
                    "fontStyle" =@ T<string>
                    "fontSize" =@ T<int>
                    "maxFontSize" =@ T<int>
                    "color" =@ T<string>
                    "defaultValue" =@ T<string>
                    "value" =@ T<string>
                    for n in ["hasAnnotation"; "readOnly"; "required"; "noExport"] do
                        n =@ T<bool>
                    "textAlign" =@ TextAlign.Type
                ]
                |+> Static [Constructor T<unit>]
            
            let AcroFormChoiceField =
                Class "AcroFormChoiceField"
                |+> Instance [
                    for n in ["combo";"edit";"sort";"multiSelect";"doNotSpellCheck";"commitOnSelChange"] do
                            n =@ T<bool>
                    "topIndex" =@ T<int>
                    "getOptions" => T<unit> ^-> T<string> 
                    "setOptions" => Type.ArrayOf(T<string>)?value ^-> T<unit>
                    "addOption" => T<string>?value ^-> T<unit>
                    "removeOption" => T<string>?value * T<bool>?allEntries ^-> T<unit>
                ]
                |=> Inherits AcroFormField
            let AcroFormListBox = Class "AcroFormListBox" |=> Inherits AcroFormChoiceField
            let AcroFormComboBox = Class "AcroFormComboBox" |=> Inherits AcroFormChoiceField
            let AcroFormEditBox = Class "AcroFormEditBox" |=> Inherits AcroFormChoiceField
            
            let AcroFormButton =
                Class "AcroFormButton"
                |+> Instance [
                    for n in ["noToggleToOff";"radio";"pushButton";"radioIsUnison"] do
                        n =@ T<bool>
                    "caption" =@ T<string>
                    "appearanceState" =@ AcroFormAppearanceState
                ]
            
            let AcroFormPushButton = Class "AcroFormPushButton" |=> Inherits AcroFormButton
            
            let AcroFormChildClass =
                Class "AcroFormChildClass"
                |+> Instance [
                    "Parent" =@ T<obj>
                    "optionName" =@ T<string>
                    "caption" =@ T<string>
                    "appearanceState" =@ AcroFormAppearanceState.Type
                ]
                |=> Inherits AcroFormField
            
            let AcroFormRadioButton =
                Class "AcroFormRadioButton"
                |+> Instance [
                    "setAppearance" => T<string>?appearance ^-> T<unit>
                    "createOption" => T<string>?name ^-> AcroFormChildClass
                ]
                |=> Inherits AcroFormButton
            
            let AcroFormCheckBox =
                Class "AcroFormCheckBox"
                |+> Instance [
                    "appearanceState" =@ AcroFormAppearanceState.Type
                ]
                |=> Inherits AcroFormButton
                
            let AcroFormTextField =
                Class "AcroFormTextField"
                |+> Instance [
                    for n in ["multiline";"fileSelect";"doNotSpellCheck";"doNotScroll";"comb";"richText";"hasAppearanceStream"] do
                        n =@ T<bool>
                    "maxLength" =@ T<int>
                    
                ]
                |=> Inherits AcroFormField
            let AcroFormPasswordField =
                Class "AcroFormPasswordField"
                |=> Inherits AcroFormTextField
            
            let typesToExport = [
                TextAlign
                AcroFormAppearanceState
                AcroFormField
                AcroFormChoiceField
                AcroFormListBox
                AcroFormComboBox
                AcroFormEditBox
                AcroFormButton
                AcroFormPushButton
                AcroFormChildClass
                AcroFormRadioButton
                AcroFormCheckBox
                AcroFormTextField
                AcroFormPasswordField
            ]
            let methodsToApply = [
                "addField" => AcroFormField?field ^-> JsPDFClass
            ]
            
        module Context2d =
            let Gradient = 
              Class "Gradient" 
              |+> Instance [ 
                "addColorStop" => T<float>?position * T<string>?color ^-> T<unit>
                "getColor" => T<unit> ^-> T<string>
              ]
            let ContextTextAlign = Pattern.EnumStrings "Context2DTextAlign" ["right"; "end"; "center"; "left"; "start"]
            let ContextTextBaseline = Pattern.EnumStrings "Context2D.TextBaseline" [
                "alphabetic"
                "bottom"
                "top"
                "hanging"
                "middle"
                "ideographic"
            ]
            
            let ContextCompositeOperation = Pattern.EnumStrings "Context2D.CompositeOperation" ["source-over"]
            let ContextImageSmoothingQuality = Pattern.EnumStrings "Context2D.ImageSmoothingQuality" ["low";"high"]
            
            let ContextLineCap = Pattern.EnumStrings "Context2D.LineCap" ["butt";"round";"square"]
            
            let ContextLineJoin = Pattern.EnumStrings "Context2D.LineJoin" ["bevel";"round";"miter"]
            let Context2d =
                Class "Context2D"
                |+> Instance [
                    "autoPaging" => T<bool>
                    "margin" =@ Type.ArrayOf T<float>
                    "fillStyle" => T<string> + Gradient
                    "filter" => T<string>
                    "font" => T<string>
                    "globalAlpha" => T<float>
                    "globalCompositeOperation" =? ContextCompositeOperation
                    "imageSmoothingEnabled" =@ T<bool>
                    "imageSmoothingQuality" =? ContextImageSmoothingQuality
                    "ignoreClearRect" =@ T<bool>
                    "lastBreak" =@ T<float>
                    "lineCap" =@ ContextLineCap
                    "lineDashOffset" => T<float>
                    "lineJoin" =@ ContextLineJoin
                    "lineWidth" => T<float>
                    "miterLimit" => T<float>
                    "pageBreaks" =@ Type.ArrayOf T<float>
                    "pageWrapXEnabled" => T<bool>
                    "pageWrapYEnabled" => T<bool>
                    "posX" => T<float>
                    "posY" => T<float>
                    "shadowBlur" => T<float>
                    "shadowColor" => T<string>
                    "shadowOffsetX" => T<float>
                    "shadowOffsetY" => T<float>
                    "strokeStyle" => T<string> + Gradient
                    "textBaseline" => ContextTextBaseline.Type
                    "textAlign" => ContextTextAlign.Type
                    "arc" => 
                      (T<float>?x *
                      T<float>?y *
                      T<float>?radius *
                      T<float>?startAngle *
                      T<float>?endAngle *
                      T<bool>?counterclockwise)
                    ^-> T<unit>
                    "arcTo" => T<float>?x1 * T<float>?y1 * T<float>?x2 * T<float>?y2 * T<float>?radius ^-> T<unit>
                    "beginPath" => T<unit> ^-> T<unit>
                    "bezierCurveTo" =>
                      T<float>?cp1x *
                      T<float>?cp1y *
                      T<float>?cp2x *
                      T<float>?cp2y *
                      T<float>?x *
                      T<float>?y    ^-> T<unit>
                    "clearRect" => T<float>?x * T<float>?y * T<float>?w * T<float>?h ^-> T<unit>
                    "clip" =>  T<unit> ^-> JsPDFClass
                    "clipEvenOdd" =>  T<unit> ^-> JsPDFClass
                    "closePath" =>  T<unit> ^-> T<unit>
                    "createLinearGradient" =>
                      T<float>?x0 *
                      T<float>?y0 *
                      T<float>?x1 *
                      T<float>?y1     ^-> Gradient
                    "createPattern" => T<unit> ^-> Gradient
                    "createRadialGradient" => T<unit> ^-> Gradient
                    "drawImage" =>
                      T<string>?img *
                      T<float>?x *
                      T<float>?y *
                      T<float>?width *
                      T<float>?height    ^-> T<unit>
                    "drawImage" =>
                      T<string>?img *
                      T<float>?sx *
                      T<float>?sy *
                      T<float>?swidth *
                      T<float>?sheight *
                      T<float>?x *
                      T<float>?y *
                      T<float>?width *
                      T<float>?height    ^-> T<unit>
                    "fill" => T<unit> ^-> T<unit>
                    "fillRect" => T<float>?x * T<float>?y * T<float>?w * T<float>?h ^-> T<unit>
                    "fillText" => T<string>?text * T<float>?x * T<float>?y * !?T<float>?maxWidth ^-> T<unit>
                    "lineTo" => T<float>?x * T<float>?y ^-> T<unit>
                    "measureText" => T<string>?text ^-> T<float>
                    "moveTo" => T<float>?x * T<float>?x ^-> T<unit>
                    "quadraticCurveTo" => T<float>?cpx * T<float>?cpy * T<float>?x * T<float>?y ^-> T<unit>
                    "rect" => T<float>?x * T<float>?y * T<float>?w * T<float>?h ^-> T<unit>
                    "restore" => T<unit> ^-> T<unit>
                    "rotate" => T<float>?angle ^-> T<unit>
                    "save" => T<unit> ^-> T<unit>
                    "scale" => T<float>?scalewidth * T<float>?scaleheight ^-> T<unit>
                    "setTransform" =>
                      T<float>?a *
                      T<float>?b *
                      T<float>?c *
                      T<float>?d *
                      T<float>?e *
                      T<float>?f    ^-> T<unit>
                    "stroke" => T<unit> ^-> T<unit>
                    "strokeRect" => T<float>?x * T<float>?y * T<float>?w * T<float>?h ^-> T<unit>
                    "strokeText" => T<string>?text * T<float>?x * T<float>?y * !?T<float>?maxWidth ^-> T<unit>
                    "transform" =>
                      T<float>?a *
                      T<float>?b *
                      T<float>?c *
                      T<float>?d *
                      T<float>?e *
                      T<float>?f    ^-> T<unit>
                    "translate" => T<float> * T<float> ^-> T<unit>
                ]
                
                
            let typesToExport = [
                Gradient
                ContextTextAlign
                ContextTextBaseline
                ContextCompositeOperation
                ContextImageSmoothingQuality
                ContextLineCap
                ContextLineJoin
                Context2d
            ]
            let methodsToApply = [
                "context2d" =? Context2d
            ]
            
        module Canvas =
            open Context2d
            
            let Canvas =
                Class "Canvas"
                |+> Instance [
                    "pdf" =? JsPDFClass
                    "width" =@ T<float>
                    "height" =@ T<float>
                    "getContext" => !? T<string>?``type`` ^-> Context2d
                ]
            let typesToExport = [Canvas]
            let methodsToApply = [
                "canvas" =? Canvas
            ]
            
        module Cell =
            let CellAlign = Pattern.EnumStrings "CellAlign" [
                "left";"center";"right"
            ]
            let CellConfig = Pattern.Config "CellConfig" {
                Required = [
                    "name", T<string>
                    "prompt", T<string>
                    "align", CellAlign.Type
                    "padding", T<float>
                    "width", T<float>
                ]
                Optional = []
            }
            let CellOptions =
                Pattern.Config "Cell.Options" {
                    Required = []
                    Optional = [
                        "font", T<string>
                        "fontSize", T<int>
                        "maxWidth", T<float>
                        "scaleFactor", T<float>
                    ] 
                }
            let CellSize =
                Class "Cell.Size"
                |+> Instance [
                    "Width" =? T<float> |> WithSourceName "w"
                    "Height" =? T<float> |> WithSourceName "h"
                ]
                
            let TableRowData = Pattern.Config "TableRowData" {
                Required = []
                Optional = [
                    "row", T<int>
                    "data", T<obj>
                ]
            }
                
            let TableCellData = Pattern.Config "TableCellData" {
                Required = []
                Optional = [
                    "row", T<int>
                    "col", T<int>
                    "data", T<obj>
                ]
            }
            
            let TableCellCss = Pattern.Config "TableCellCss" {
                Required = [
                    "font-size", T<int>
                ]
                Optional = []
            }
            let TableConfig = Pattern.Config "TableConfig" {
                Required = []
                Optional = [
                    "printHeaders", T<bool>
                    "autoSize", T<bool>
                    "margins", T<float>
                    "fontSize", T<int>
                    "padding", T<float>
                    "headerBackgroundColor", T<string>
                    "headerTextColor", T<string>
                    "rowStart", TableRowData?e * JsPDFClass?pdf ^-> T<unit>
                    "cellStart", TableCellData?e * JsPDFClass?pdf ^-> T<unit>
                ]
            }
            let typesToExport = [
                CellAlign
                CellConfig
                CellOptions
                CellSize
                TableRowData
                TableCellData
                TableCellCss
                TableConfig
            ]
            let methodsToApply = [
                "setHeaderFunction" => (JsPDFClass?pdf * T<int>?pages ^-> Type.ArrayOf(T<int>))?func ^-> T<unit>
                "getTextDimensions" => T<string>?text * !?CellOptions?options ^-> CellSize
                "cellAddPage" => T<unit> ^-> JsPDFClass
                "cell" => T<float>?x * T<float>?y * T<float>?w * T<float>?h * T<string>?txt * T<int>?ln * T<string>?align ^-> JsPDFClass
                "table" => T<float>?x * T<float>?y
                               * T<System.Collections.Generic.Dictionary<string,string>>?data
                               * (Type.ArrayOf(T<string>) + Type.ArrayOf(CellConfig))?headers * TableConfig?config
                           ^-> JsPDFClass
                "calculateLineHeight" => Type.ArrayOf(T<string>)?headerNames * Type.ArrayOf(T<int>)?columnWidths * Type.ArrayOf(T<obj>)?model ^-> JsPDFClass
                "setTableHeaderRow" => Type.ArrayOf(CellConfig)?config ^-> T<unit>
                "printHeaderRow" => T<int>?lineNumber * (!?T<bool>)?new_page ^-> T<unit>
                
            ]
        
        module Outline =
            let OutlineItem =
                Class "OutlineItem"
                |+> Instance [
                    "title" =@ T<string>
                    "options" =@ T<obj>
                    "children" =@ Type.ArrayOf T<obj>
                ]
            let OutlineOptions = Pattern.Config "OutlineOptions" {
                Required = [
                    "pageNumber", T<int>
                ]
                Optional = [] 
            }
            
            let typesToExport = [
                OutlineItem
                OutlineOptions
            ]
            let methodsToApply = [
                "add" => T<obj>?parent * T<string>?title * OutlineOptions?options ^-> OutlineItem    
            ]
            
        module FileLoading =
            let methodsToApply = [
                "loadFile" => T<string>?url * (!?T<bool>)?sync ^-> T<string>
                "loadFile" => T<string>?url * (T<string>?data ^-> T<string>)?callback ^-> T<unit>
                |> WithInline "$this.loadFile($url, false, $callback)"
            ]
        
        module JavaScript =
            let methodsToApply = ["addJs" => T<string>?javascript ^-> JsPDFClass]
            
        module SplitTextToSize =
            let methodsToApply = [
                "getCharWidthsArray" => T<string>?text * T<obj>?options ^-> Type.ArrayOf(T<obj>)
                "getStringUnitWidth" => T<string>?text * T<obj>?options ^-> T<int>
                "splitTextToSize" => T<string>?text * T<int>?maxLen * T<obj>?options ^-> T<obj>
            ]
        module SVG =
            let methodsToApply = [
                "addSvgAsImage" => T<string>?svg * T<float>?x * T<float>?y * T<float>?w * T<float>?h
                                    * (!?T<string>)?alias * (!?T<bool>?compression) * (!?T<float>?rotation)
                                    ^-> JsPDFClass
            ]
            
        module SetLanguage =
            let LangCodes = Pattern.EnumStrings "LangCode" [
                "af"
                "sq"
                "ar"
                "ar-DZ"
                "ar-BH"
                "ar-EG"
                "ar-IQ"
                "ar-JO"
                "ar-KW"
                "ar-LB"
                "ar-LY"
                "ar-MA"
                "ar-OM"
                "ar-QA"
                "ar-SA"
                "ar-SY"
                "ar-TN"
                "ar-AE"
                "ar-YE"
                "an"
                "hy"
                "as"
                "ast"
                "az"
                "eu"
                "be"
                "bn"
                "bs"
                "br"
                "bg"
                "my"
                "ca"
                "ch"
                "ce"
                "zh"
                "zh-HK"
                "zh-CN"
                "zh-SG"
                "zh-TW"
                "cv"
                "co"
                "cr"
                "hr"
                "cs"
                "da"
                "nl"
                "nl-BE"
                "en"
                "en-AU"
                "en-BZ"
                "en-CA"
                "en-IE"
                "en-JM"
                "en-NZ"
                "en-PH"
                "en-ZA"
                "en-TT"
                "en-GB"
                "en-US"
                "en-ZW"
                "eo"
                "et"
                "fo"
                "fj"
                "fi"
                "fr"
                "fr-BE"
                "fr-CA"
                "fr-FR"
                "fr-LU"
                "fr-MC"
                "fr-CH"
                "fy"
                "fur"
                "gd"
                "gd-IE"
                "gl"
                "ka"
                "de"
                "de-AT"
                "de-DE"
                "de-LI"
                "de-LU"
                "de-CH"
                "el"
                "gu"
                "ht"
                "he"
                "hi"
                "hu"
                "is"
                "id"
                "iu"
                "ga"
                "it"
                "it-CH"
                "ja"
                "kn"
                "ks"
                "kk"
                "km"
                "ky"
                "tlh"
                "ko"
                "ko-KP"
                "ko-KR"
                "la"
                "lv"
                "lt"
                "lb"
                "mk"
                "ms"
                "ml"
                "mt"
                "mi"
                "mr"
                "mo"
                "nv"
                "ng"
                "ne"
                "no"
                "nb"
                "nn"
                "oc"
                "or"
                "om"
                "fa"
                "fa-IR"
                "pl"
                "pt"
                "pt-BR"
                "pa"
                "pa-IN"
                "pa-PK"
                "qu"
                "rm"
                "ro"
                "ro-MO"
                "ru"
                "ru-MO"
                "sz"
                "sg"
                "sa"
                "sc"
                "sd"
                "si"
                "sr"
                "sk"
                "sl"
                "so"
                "sb"
                "es"
                "es-AR"
                "es-BO"
                "es-CL"
                "es-CO"
                "es-CR"
                "es-DO"
                "es-EC"
                "es-SV"
                "es-GT"
                "es-HN"
                "es-MX"
                "es-NI"
                "es-PA"
                "es-PY"
                "es-PE"
                "es-PR"
                "es-ES"
                "es-UY"
                "es-VE"
                "sx"
                "sw"
                "sv"
                "sv-FI"
                "sv-SV"
                "ta"
                "tt"
                "te"
                "th"
                "tig"
                "ts"
                "tn"
                "tr"
                "tk"
                "uk"
                "hsb"
                "ur"
                "ve"
                "vi"
                "vo"
                "wa"
                "cy"
                "xh"
                "ji"
                "zu"
            ]
            
            
            let typesToExport = [LangCodes]
            let methodsToApply = [
                "setLanguage" => LangCodes?langCode ^-> JsPDFClass
            ]
            
        module TotalPages =
            let methodsToApply = [
                "putTotalPages" => T<string>?pageExpression ^-> JsPDFClass
            ]
            
        module ViewerPreferences =
            let ViewerScreenPageMode = Pattern.EnumStrings "NonFullScreenPageMode" [
                "UseNone"; "UseOutlines"; "UseThumbs"; "UseOC"
            ]
            
            let ViewerDirection = Pattern.EnumStrings "ViewerDirection" [
                "L2R";"R2L"
            ]
            
            let PrintScaling = Pattern.EnumStrings "PrintScaling" [
                "AppDefault"; "None"
            ]
            
            let DuplexType = Pattern.EnumStrings "Duplex" [
                "Simplex"; "DuplexFlipShortEdge"; "DuplexFlipLongEdge"; "none"
            ]
            
            let ViewerPreferenceBox = Pattern.EnumStrings "ViewerPreferenceBox" [
                "MediaBox"; "CropBox"; "TrimBox"; "BleedBox"; "ArtBox"
            ]
            
            
            let ViewerPreferencesInput =
                Pattern.Config "ViewerPreferencesInput" {
                    Required = [
                        
                    ]
                    Optional = [
                        for n in [
                            "HideToolbar"
                            "HideMenubar"
                            "HideWindowUI"
                            "FitWindow"
                            "CenterWindow"
                            "DisplayDocTitle"
                        ] do
                            n, T<bool>
                        "NonFullScreenPageMode", ViewerScreenPageMode.Type
                        "Direction", ViewerDirection.Type
                        for n in ["View";"Print"] do
                            $"{n}Area", ViewerPreferenceBox.Type
                            $"{n}Clip", ViewerPreferenceBox.Type
                        "PrintScaling", PrintScaling.Type
                        "Duplex", DuplexType.Type
                        "PickTrayByPDFSize", T<bool>
                        "PrintPageRange", Type.ArrayXD 2 T<int>
                        "NumCopies", T<int>
                    ] 
                }
            
            let typesToExport = [
                ViewerScreenPageMode
                ViewerDirection
                PrintScaling
                DuplexType
                ViewerPreferenceBox
                ViewerPreferencesInput
            ]
            let methodsToApply = [
                "viewerPreferences" => ViewerPreferencesInput?options * T<bool>?doReset ^-> JsPDFClass
                // "viewerPreferencesReset" => T<unit> ^-> JsPDFClass |> WithInline """$this.viewerPreferences(arg: "reset")"""
            ]
            
        module VFS =
            let methodsToApply = [
                "existsFileInVFS" => T<string>?fileName ^-> T<bool>
                "addFileToVFS" => T<string>?fileName * T<string>?fileContent ^-> JsPDFClass
                "getFileFromVFS" => T<string>?fileName ^-> T<string>
            ]
            
        module XmpMetadata =
            let methodsToApply = [
                "addXmpMetadata" => T<string>?metadata * T<string>?namespaceUri ^-> JsPDFClass |> WithSourceName "addMetadata"
            ]
        
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
                    "outputImage" => HTMLWorkerOutputImgType.Type?``type`` ^-> T<JavaScript.Promise<string>> |> WithSourceName "outputImg"
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
            for t in AddImage.typesToExport do t
            for t in Annotations.typesToExport do t
            for t in AcroForm.typesToExport do t
            for t in Html.typesToExport do t
            for t in AutoPrint.typesToExport do t
            for t in Context2d.typesToExport do t
            for t in Canvas.typesToExport do t
            for t in Cell.typesToExport do t
            for t in Outline.typesToExport do t
            for t in SetLanguage.typesToExport do t
            for t in ViewerPreferences.typesToExport do t
        ]
        let methodsToApply : CodeModel.IClassMember list =
            [
                for m in AddImage.methodsToApply do m
                for m in Arabic.methodsToApply do m
                for m in Annotations.methodsToApply do m
                for m in AcroForm.methodsToApply do m
                for m in Html.methodsToApply do m
                for m in AutoPrint.methodsToApply do m
                for m in Context2d.methodsToApply do m
                for m in Canvas.methodsToApply do m
                for m in Cell.methodsToApply do m
                for m in Outline.methodsToApply do m
                for m in FileLoading.methodsToApply do m
                for m in SplitTextToSize.methodsToApply do m
                for m in SVG.methodsToApply do m
                for m in SetLanguage.methodsToApply do m
                for m in TotalPages.methodsToApply do m
                for m in ViewerPreferences.methodsToApply do m
                for m in VFS.methodsToApply do m
                for m in XmpMetadata.methodsToApply do m
                
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
