// $begin{copyright}
//
// This file is part of WebSharper
//
// Copyright (c) 2008-2016 IntelliFactory
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

IntelliFactory = {
    Runtime: {
        Ctor: function (ctor, typeFunction) {
            ctor.prototype = typeFunction.prototype;
            return ctor;
        },

        Cctor: function (cctor) {
            var init = true;
            return function () {
                if (init) {
                    init = false;
                    cctor();
                }
            };
        },

        Class: function (members, base, statics) {
            var proto = base ? new base() : {};
            var typeFunction = function (copyFrom) {
                if (copyFrom) {
                    for (var f in copyFrom) { this[f] = copyFrom[f] }
                }
            }
            for (var m in members) { proto[m] = members[m] }
            typeFunction.prototype = proto;
            if (statics) {
                for (var f in statics) { typeFunction[f] = statics[f] }
            }
            return typeFunction;
        },

        Clone: function (obj) {
            var res = {};
            for (var p in obj) { res[p] = obj[p] }
            return res;
        },

        NewObject:
            function (kv) {
                var o = {};
                for (var i = 0; i < kv.length; i++) {
                    o[kv[i][0]] = kv[i][1];
                }
                return o;
            },

        DeleteEmptyFields:
            function (obj, fields) {
                for (var i = 0; i < fields.length; i++) {
                    var f = fields[i];
                    if (obj[f] === void (0)) { delete obj[f]; }
                }
                return obj;
            },

        GetOptional:
            function (value) {
                return (value === void (0)) ? null : { $: 1, $0: value };
            },

        SetOptional:
            function (obj, field, value) {
                if (value) {
                    obj[field] = value.$0;
                } else {
                    delete obj[field];
                }
            },

        SetOrDelete:
            function (obj, field, value) {
                if (value === void (0)) {
                    delete obj[field];
                } else {
                    obj[field] = value;
                }
            },

        Bind: function (f, obj) {
            return function () { return f.apply(this, arguments) };
        },

        CreateFuncWithArgs: function (f) {
            return function () { return f(Array.prototype.slice.call(arguments)) };
        },

        CreateFuncWithOnlyThis: function (f) {
            return function () { return f(this) };
        },

        CreateFuncWithThis: function (f) {
            return function () { return f(this).apply(null, arguments) };
        },

        CreateFuncWithThisArgs: function (f) {
            return function () { return f(this)(Array.prototype.slice.call(arguments)) };
        },

        CreateFuncWithRest: function (length, f) {
            return function () { return f(Array.prototype.slice.call(arguments, 0, length).concat([Array.prototype.slice.call(arguments, length)])) };
        },

        CreateFuncWithArgsRest: function (length, f) {
            return function () { return f([Array.prototype.slice.call(arguments, 0, length), Array.prototype.slice.call(arguments, length)]) };
        },

        BindDelegate: function (func, obj) {
            var res = func.bind(obj);
            res.$Func = func;
            res.$Target = obj;
            return res;
        },

        CreateDelegate: function (invokes) {
            if (invokes.length == 0) return null;
            if (invokes.length == 1) return invokes[0];
            var del = function () {
                var res;
                for (var i = 0; i < invokes.length; i++) {
                    res = invokes[i].apply(null, arguments);
                }
                return res;
            };
            del.$Invokes = invokes;
            return del;
        },

        CombineDelegates: function (dels) {
            var invokes = [];
            for (var i = 0; i < dels.length; i++) {
                var del = dels[i];
                if (del) {
                    if ("$Invokes" in del)
                        invokes = invokes.concat(del.$Invokes);
                    else
                        invokes.push(del);
                }
            }
            return IntelliFactory.Runtime.CreateDelegate(invokes);
        },

        DelegateEqual: function (d1, d2) {
            if (d1 === d2) return true;
            if (d1 == null || d2 == null) return false;
            var i1 = d1.$Invokes || [d1];
            var i2 = d2.$Invokes || [d2];
            if (i1.length != i2.length) return false;
            for (var i = 0; i < i1.length; i++) {
                var e1 = i1[i];
                var e2 = i2[i];
                if (!(e1 === e2 || ("$Func" in e1 && "$Func" in e2 && e1.$Func === e2.$Func && e1.$Target == e2.$Target)))
                    return false;
            }
            return true;
        },

        ThisFunc: function (d) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return d.apply(null, args);
            };
        },

        ThisFuncOut: function (f) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return f.apply(args.shift(), args);
            };
        },

        ParamsFunc: function (length, d) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return d.apply(null, args.slice(0, length).concat([args.slice(length)]));
            };
        },

        ParamsFuncOut: function (length, f) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return f.apply(null, args.slice(0, length).concat(args[length]));
            };
        },

        ThisParamsFunc: function (length, d) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return d.apply(null, args.slice(0, length + 1).concat([args.slice(length + 1)]));
            };
        },

        ThisParamsFuncOut: function (length, f) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return f.apply(args.shift(), args.slice(0, length).concat(args[length]));
            };
        },

        Curried: function (f, n, args) {
            args = args || [];
            return function (a) {
                var allArgs = args.concat([a === void (0) ? null : a]);
                if (n == 1)
                    return f.apply(null, allArgs);
                if (n == 2)
                    return function (a) { return f.apply(null, allArgs.concat([a === void (0) ? null : a])); }
                return IntelliFactory.Runtime.Curried(f, n - 1, allArgs);
            }
        },

        Curried2: function (f) {
            return function (a) { return function (b) { return f(a, b); } }
        },

        Curried3: function (f) {
            return function (a) { return function (b) { return function (c) { return f(a, b, c); } } }
        },

        UnionByType: function (types, value, optional) {
            var vt = typeof value;
            for (var i = 0; i < types.length; i++) {
                var t = types[i];
                if (typeof t == "number") {
                    if (Array.isArray(value) && (t == 0 || value.length == t)) {
                        return { $: i, $0: value };
                    }
                } else {
                    if (t == vt) {
                        return { $: i, $0: value };
                    }
                }
            }
            if (!optional) {
                throw new Error("Type not expected for creating Choice value.");
            }
        },

        OnLoad:
            function (f) {
                if (!("load" in this)) {
                    this.load = [];
                }
                this.load.push(f);
            },

        Start:
            function () {
                function run(c) {
                    for (var i = 0; i < c.length; i++) {
                        c[i]();
                    }
                }
                if ("init" in this) {
                    run(this.init);
                    this.init = [];
                }
                if ("load" in this) {
                    run(this.load);
                    this.load = [];
                }
            },
    }
}

IntelliFactory.Runtime.OnLoad(function () {
    if (window.WebSharper && WebSharper.Activator && WebSharper.Activator.Activate)
        WebSharper.Activator.Activate()
});

// Polyfill

if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

if (!Math.trunc) {
    Math.trunc = function (x) {
        return x < 0 ? Math.ceil(x) : Math.floor(x);
    }
}

function ignore() { };
function id(x) { return x };
function fst(x) { return x[0] };
function snd(x) { return x[1] };
function trd(x) { return x[2] };

if (!console) {
    console = {
        count: ignore,
        dir: ignore,
        error: ignore,
        group: ignore,
        groupEnd: ignore,
        info: ignore,
        log: ignore,
        profile: ignore,
        profileEnd: ignore,
        time: ignore,
        timeEnd: ignore,
        trace: ignore,
        warn: ignore
    }
};
(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
;
(function()
{
 "use strict";
 var Global,WebSharper,JsPDF,Sample,Client,Operators,Ref,List,UI,Next,Html,attr,T,Doc,Arrays,WebSharper$JsPDF$Sample_Templates,AttrProxy,JavaScript,Pervasives,DomUtility,Attrs,Client$1,DocNode,Array,Elt,Unchecked,DocElemNode,View,SC$1,Docs,Var,Collections,Dictionary,JSModule,Abbrev,Mailbox,Attrs$1,Dyn,Int32,Enumerator,SC$2,Snap,Fresh,SC$3,CheckedInput,AttrModule,Slice,Strings,Docs$1,RunState,NodeSet,An,Async,T$1,Seq,HashSet,DictionaryUtil,String,Concurrency,Anims,AppendList,SC$4,Char,N,DynamicAttrNode,SC$5,HashSet$1,Scheduler,SC$6,Easing,DomNodes,OperationCanceledException,CancellationTokenSource,HashSetUtil,SC$7,Lazy,IntelliFactory,Runtime;
 Global=window;
 WebSharper=Global.WebSharper=Global.WebSharper||{};
 JsPDF=WebSharper.JsPDF=WebSharper.JsPDF||{};
 Sample=JsPDF.Sample=JsPDF.Sample||{};
 Client=Sample.Client=Sample.Client||{};
 Operators=WebSharper.Operators=WebSharper.Operators||{};
 Ref=WebSharper.Ref=WebSharper.Ref||{};
 List=WebSharper.List=WebSharper.List||{};
 UI=WebSharper.UI=WebSharper.UI||{};
 Next=UI.Next=UI.Next||{};
 Html=Next.Html=Next.Html||{};
 attr=Html.attr=Html.attr||{};
 T=List.T=List.T||{};
 Doc=Next.Doc=Next.Doc||{};
 Arrays=WebSharper.Arrays=WebSharper.Arrays||{};
 WebSharper$JsPDF$Sample_Templates=Global.WebSharper$JsPDF$Sample_Templates=Global.WebSharper$JsPDF$Sample_Templates||{};
 AttrProxy=Next.AttrProxy=Next.AttrProxy||{};
 JavaScript=WebSharper.JavaScript=WebSharper.JavaScript||{};
 Pervasives=JavaScript.Pervasives=JavaScript.Pervasives||{};
 DomUtility=Next.DomUtility=Next.DomUtility||{};
 Attrs=Next.Attrs=Next.Attrs||{};
 Client$1=Next.Client=Next.Client||{};
 DocNode=Client$1.DocNode=Client$1.DocNode||{};
 Array=Next.Array=Next.Array||{};
 Elt=Next.Elt=Next.Elt||{};
 Unchecked=WebSharper.Unchecked=WebSharper.Unchecked||{};
 DocElemNode=Next.DocElemNode=Next.DocElemNode||{};
 View=Next.View=Next.View||{};
 SC$1=Global.StartupCode$WebSharper_UI_Next$DomUtility=Global.StartupCode$WebSharper_UI_Next$DomUtility||{};
 Docs=Next.Docs=Next.Docs||{};
 Var=Next.Var=Next.Var||{};
 Collections=WebSharper.Collections=WebSharper.Collections||{};
 Dictionary=Collections.Dictionary=Collections.Dictionary||{};
 JSModule=JavaScript.JSModule=JavaScript.JSModule||{};
 Abbrev=Next.Abbrev=Next.Abbrev||{};
 Mailbox=Abbrev.Mailbox=Abbrev.Mailbox||{};
 Attrs$1=Client$1.Attrs=Client$1.Attrs||{};
 Dyn=Attrs$1.Dyn=Attrs$1.Dyn||{};
 Int32=WebSharper.Int32=WebSharper.Int32||{};
 Enumerator=WebSharper.Enumerator=WebSharper.Enumerator||{};
 SC$2=Global.StartupCode$WebSharper_UI_Next$Attr_Client=Global.StartupCode$WebSharper_UI_Next$Attr_Client||{};
 Snap=Next.Snap=Next.Snap||{};
 Fresh=Abbrev.Fresh=Abbrev.Fresh||{};
 SC$3=Global.StartupCode$WebSharper_UI_Next$Doc_Client=Global.StartupCode$WebSharper_UI_Next$Doc_Client||{};
 CheckedInput=Next.CheckedInput=Next.CheckedInput||{};
 AttrModule=Next.AttrModule=Next.AttrModule||{};
 Slice=WebSharper.Slice=WebSharper.Slice||{};
 Strings=WebSharper.Strings=WebSharper.Strings||{};
 Docs$1=Client$1.Docs=Client$1.Docs||{};
 RunState=Docs$1.RunState=Docs$1.RunState||{};
 NodeSet=Docs$1.NodeSet=Docs$1.NodeSet||{};
 An=Next.An=Next.An||{};
 Async=Abbrev.Async=Abbrev.Async||{};
 T$1=Enumerator.T=Enumerator.T||{};
 Seq=WebSharper.Seq=WebSharper.Seq||{};
 HashSet=Collections.HashSet=Collections.HashSet||{};
 DictionaryUtil=Collections.DictionaryUtil=Collections.DictionaryUtil||{};
 String=Next.String=Next.String||{};
 Concurrency=WebSharper.Concurrency=WebSharper.Concurrency||{};
 Anims=Next.Anims=Next.Anims||{};
 AppendList=Next.AppendList=Next.AppendList||{};
 SC$4=Global.StartupCode$WebSharper_UI_Next$Abbrev=Global.StartupCode$WebSharper_UI_Next$Abbrev||{};
 Char=WebSharper.Char=WebSharper.Char||{};
 N=WebSharper.N=WebSharper.N||{};
 DynamicAttrNode=Next.DynamicAttrNode=Next.DynamicAttrNode||{};
 SC$5=Global.StartupCode$WebSharper_UI_Next$Animation=Global.StartupCode$WebSharper_UI_Next$Animation||{};
 HashSet$1=Abbrev.HashSet=Abbrev.HashSet||{};
 Scheduler=Concurrency.Scheduler=Concurrency.Scheduler||{};
 SC$6=Global.StartupCode$WebSharper_Main$Concurrency=Global.StartupCode$WebSharper_Main$Concurrency||{};
 Easing=Next.Easing=Next.Easing||{};
 DomNodes=Docs$1.DomNodes=Docs$1.DomNodes||{};
 OperationCanceledException=WebSharper.OperationCanceledException=WebSharper.OperationCanceledException||{};
 CancellationTokenSource=WebSharper.CancellationTokenSource=WebSharper.CancellationTokenSource||{};
 HashSetUtil=Collections.HashSetUtil=Collections.HashSetUtil||{};
 SC$7=Global.StartupCode$WebSharper_UI_Next$AppendList=Global.StartupCode$WebSharper_UI_Next$AppendList||{};
 Lazy=WebSharper.Lazy=WebSharper.Lazy||{};
 IntelliFactory=Global.IntelliFactory;
 Runtime=IntelliFactory&&IntelliFactory.Runtime;
 Client.Main=function()
 {
  var doc,v,v$1,pdf,pdfRender,a,a$1,a$2,t;
  doc=new Global.jsPDF();
  v=doc.text("Hello world!",10,10,function()
  {
   return{};
  });
  doc.addPage();
  v$1=doc.text("Hello world on Page 2!",10,10,function()
  {
   return{};
  });
  pdf=Global.String(doc.output("bloburl",function()
  {
   return{};
  }));
  pdfRender=(a=List.ofArray([AttrProxy.Create("width","100%"),AttrProxy.Create("height","100%"),AttrProxy.Create("data",pdf),AttrProxy.Create("type","application/pdf")]),(a$1=T.Empty,Doc.Element("object",a,a$1)));
  a$2=WebSharper$JsPDF$Sample_Templates.main((t=T.Empty,new T({
   $:1,
   $0:{
    $:0,
    $0:"pdf",
    $1:pdfRender
   },
   $1:t
  })));
  Doc.RunById("main",a$2);
 };
 Operators.FailWith=function(msg)
 {
  throw Global.Error(msg);
 };
 Operators.DefaultArg=function(x,d)
 {
  return x==null?d:x.$0;
 };
 Operators.KeyValue=function(kvp)
 {
  return[kvp.K,kvp.V];
 };
 Ref.decr=function(x)
 {
  x[0]--;
 };
 Operators.Compare=function(a,b)
 {
  return Unchecked.Compare(a,b);
 };
 List.ofArray=function(arr)
 {
  var r,i,$1;
  r=T.Empty;
  for(i=Arrays.length(arr)-1,$1=0;i>=$1;i--)r=new T({
   $:1,
   $0:Arrays.get(arr,i),
   $1:r
  });
  return r;
 };
 List.head=function(l)
 {
  return l.$==1?l.$0:List.listEmpty();
 };
 List.tail=function(l)
 {
  return l.$==1?l.$1:List.listEmpty();
 };
 List.listEmpty=function()
 {
  return Operators.FailWith("The input list was empty.");
 };
 attr=Html.attr=Runtime.Class({},null,attr);
 T=List.T=Runtime.Class({
  GetEnumerator:function()
  {
   return new T$1.New(this,null,function(e)
   {
    var m,xs;
    m=e.s;
    return m.$==0?false:(xs=m.$1,(e.c=m.$0,e.s=xs,true));
   },void 0);
  },
  GetEnumerator0:function()
  {
   return Enumerator.Get(this);
  }
 },null,T);
 T.Empty=new T({
  $:0
 });
 Doc=Next.Doc=Runtime.Class({},null,Doc);
 Doc.Element=function(name,attr$1,children)
 {
  var attr$2,children$1,a;
  attr$2=AttrProxy.Concat(attr$1);
  children$1=Doc.Concat(children);
  a=DomUtility.CreateElement(name);
  return Elt.New(a,attr$2,children$1);
 };
 Doc.Concat=function(xs)
 {
  var x,d;
  x=Array.ofSeqNonCopying(xs);
  d=Doc.Empty();
  return Array.TreeReduce(d,Doc.Append,x);
 };
 Doc.RunById=function(id,tr)
 {
  var m;
  m=DomUtility.Doc().getElementById(id);
  Unchecked.Equals(m,null)?Operators.FailWith("invalid id: "+id):Doc.Run(m,tr);
 };
 Doc.Empty=function()
 {
  var a,a$1;
  a=DocNode.EmptyDoc;
  a$1=View.Const();
  return Doc.Mk(a,a$1);
 };
 Doc.Append=function(a,b)
 {
  var x,x$1,y,a$1;
  x=(x$1=a.updates,(y=b.updates,View.Map2Unit(x$1,y)));
  a$1={
   $:0,
   $0:a.docNode,
   $1:b.docNode
  };
  return Doc.Mk(a$1,x);
 };
 Doc.LoadLocalTemplates=function(baseName)
 {
  (function()
  {
   var a,m,m$1,name,name$1;
   while(true)
    {
     m=Global.document.querySelector("[ws-template]");
     if(Unchecked.Equals(m,null))
      {
       m$1=Global.document.querySelector("[ws-children-template]");
       if(Unchecked.Equals(m$1,null))
        return null;
       else
        {
         name=m$1.getAttribute("ws-children-template");
         m$1.removeAttribute("ws-children-template");
         a=function(n)
         {
          return function()
          {
           return DomUtility.ChildrenArray(n);
          };
         }(m$1);
         Doc.PrepareTemplate(baseName,{
          $:1,
          $0:name
         },a);
        }
      }
     else
      {
       name$1=m.getAttribute("ws-template");
       Doc.PrepareSingleTemplate(baseName,{
        $:1,
        $0:name$1
       },m);
      }
    }
  }());
 };
 Doc.NamedTemplate=function(baseName,name,fillWith)
 {
  var name$1,m,o,t,a;
  name$1=Doc.ComposeName(baseName,name);
  m=(o=null,[Docs.LoadedTemplates().TryGetValue(name$1,{
   get:function()
   {
    return o;
   },
   set:function(v)
   {
    o=v;
   }
  }),o]);
  return m[0]?(t=m[1],(a=t.cloneNode(true),Doc.ChildrenTemplate(a,fillWith))):(Global.console.warn.apply(Global.console,["Local template doesn't exist"].concat([name$1])),Doc.Empty());
 };
 Doc.Run=function(parent,doc)
 {
  var d,st,p,a;
  d=doc.docNode;
  Docs.LinkElement(parent,d);
  st=Docs.CreateRunState(parent,d);
  p=Mailbox.StartProcessor(Docs.PerformAnimatedUpdate(st,d));
  a=doc.updates;
  View.Sink(p,a);
 };
 Doc.Mk=function(node,updates)
 {
  return new Doc.New(node,updates);
 };
 Doc.PrepareTemplate=function(baseName,name,els)
 {
  var els$1,i,$1,el,m,v;
  if(!Docs.LoadedTemplates().ContainsKey(Doc.ComposeName(baseName,name)))
   {
    els$1=els();
    for(i=0,$1=els$1.length-1;i<=$1;i++){
     el=Arrays.get(els$1,i);
     m=el.parentNode;
     Unchecked.Equals(m,null)?void 0:v=m.removeChild(el);
    }
    Doc.PrepareTemplateStrict(baseName,name,els$1);
   }
 };
 Doc.PrepareSingleTemplate=function(baseName,name,el)
 {
  var m,m$1,n,v;
  el.removeAttribute("ws-template");
  m=el.getAttribute("ws-replace");
  m===null?void 0:(el.removeAttribute("ws-replace"),m$1=el.parentNode,Unchecked.Equals(m$1,null)?void 0:(n=Global.document.createElement(el.tagName),n.setAttribute("ws-replace",m),v=m$1.replaceChild(n,el)));
  Doc.PrepareTemplateStrict(baseName,name,[el]);
 };
 Doc.ComposeName=function(baseName,name)
 {
  return(baseName+"/"+Operators.DefaultArg(name,"")).toLowerCase();
 };
 Doc.ChildrenTemplate=function(el,fillWith)
 {
  var els,addAttr,tryGetAsDoc,docTreeNode,R,updates,d,$1,e,holes,updates$1,attrs,afterRender,fw,e$1,x;
  holes=[];
  updates$1=[];
  attrs=[];
  afterRender=[];
  fw=new Dictionary.New$5();
  e$1=Enumerator.Get(fillWith);
  try
  {
   while(e$1.MoveNext())
    {
     x=e$1.Current();
     fw.set_Item(x.$0,x);
    }
  }
  finally
  {
   if("Dispose"in e$1)
    e$1.Dispose();
  }
  els=DomUtility.ChildrenArray(el);
  addAttr=function(el$1,attr$1)
  {
   var attr$2,v,v$1,a;
   attr$2=Attrs.Insert(el$1,attr$1);
   v=updates$1.push(Attrs.Updates(attr$2));
   v$1=attrs.push([el$1,attr$2]);
   a=function(f)
   {
    var v$2;
    v$2=afterRender.push(function()
    {
     f(el$1);
    });
   };
   return function(o)
   {
    if(o==null)
     ;
    else
     a(o.$0);
   }(Runtime.GetOptional(attr$2.OnAfterRender));
  };
  tryGetAsDoc=function(name)
  {
   var m,o,text,tv,v,v$1,v$2,v$3,v$4,v$5,v$6,v$7,v$8,v$9,v$10;
   m=(o=null,[fw.TryGetValue(name,{
    get:function()
    {
     return o;
    },
    set:function(v$11)
    {
     o=v$11;
    }
   }),o]);
   return m[0]?m[1].$==0?{
    $:1,
    $0:m[1].$1
   }:m[1].$==1?(text=m[1].$1,{
    $:1,
    $0:Doc.TextNode(text)
   }):m[1].$==2?(tv=m[1].$1,{
    $:1,
    $0:Doc.TextView(tv)
   }):m[1].$==6?(v=m[1].$1,{
    $:1,
    $0:Doc.TextView(v.RView())
   }):m[1].$==7?(v$1=m[1].$1,{
    $:1,
    $0:Doc.TextView((v$2=v$1.RView(),View.Map(Global.String,v$2)))
   }):m[1].$==8?(v$3=m[1].$1,{
    $:1,
    $0:Doc.TextView((v$4=v$3.RView(),View.Map(function(i)
    {
     return i.get_Input();
    },v$4)))
   }):m[1].$==9?(v$5=m[1].$1,{
    $:1,
    $0:Doc.TextView((v$6=v$5.RView(),View.Map(Global.String,v$6)))
   }):m[1].$==10?(v$7=m[1].$1,{
    $:1,
    $0:Doc.TextView((v$8=v$7.RView(),View.Map(function(i)
    {
     return i.get_Input();
    },v$8)))
   }):m[1].$==11?(v$9=m[1].$1,{
    $:1,
    $0:Doc.TextView((v$10=v$9.RView(),View.Map(Global.String,v$10)))
   }):(Global.console.warn.apply(Global.console,["Content hole filled with attribute data"].concat([name])),null):null;
  };
  DomUtility.IterSelector(el,"[ws-hole]",function(p)
  {
   var m,doc,v,v$1,name,v$2;
   name=p.getAttribute("ws-hole");
   p.removeAttribute("ws-hole");
   while(p.hasChildNodes())
    {
     v$2=p.removeChild(p.lastChild);
    }
   m=tryGetAsDoc(name);
   (m!=null?m.$==1:false)?(doc=m.$0,Docs.LinkElement(p,doc.docNode),v=holes.push(DocElemNode.New(Attrs.Empty(p),doc.docNode,null,p,Fresh.Int(),null)),v$1=updates$1.push(doc.updates)):void 0;
  });
  DomUtility.IterSelector(el,"[ws-replace]",function(e$2)
  {
   var name,m,doc,p,after,v,before,a,p$1,v$1,v$2;
   name=e$2.getAttribute("ws-replace");
   m=tryGetAsDoc(name);
   (m!=null?m.$==1:false)?(doc=m.$0,p=e$2.parentNode,after=Global.document.createTextNode(""),v=p.replaceChild(after,e$2),before=Docs.InsertBeforeDelim(after,doc.docNode),a=function(i)
   {
    Arrays.set(els,i,doc.docNode);
   },function(o)
   {
    if(o==null)
     ;
    else
     a(o.$0);
   }((p$1=function(y)
   {
    return e$2===y;
   },function(a$1)
   {
    return Arrays.tryFindIndex(p$1,a$1);
   }(els))),v$1=holes.push(DocElemNode.New(Attrs.Empty(p),doc.docNode,{
    $:1,
    $0:[before,after]
   },p,Fresh.Int(),null)),v$2=updates$1.push(doc.updates)):void 0;
  });
  DomUtility.IterSelector(el,"[ws-attr]",function(e$2)
  {
   var name,m,o;
   name=e$2.getAttribute("ws-attr");
   e$2.removeAttribute("ws-attr");
   m=(o=null,[fw.TryGetValue(name,{
    get:function()
    {
     return o;
    },
    set:function(v)
    {
     o=v;
    }
   }),o]);
   m[0]?m[1].$==3?addAttr(e$2,m[1].$1):Global.console.warn.apply(Global.console,["Attribute hole filled with non-attribute data"].concat([name])):void 0;
  });
  DomUtility.IterSelector(el,"[ws-on]",function(e$2)
  {
   var c,_this;
   addAttr(e$2,AttrProxy.Concat((c=function(x$1)
   {
    var a,m,o,handler,a$1,ps;
    a=Strings.SplitChars(x$1,[58],1);
    m=(o=null,[fw.TryGetValue(Arrays.get(a,1),{
     get:function()
     {
      return o;
     },
     set:function(v)
     {
      o=v;
     }
    }),o]);
    return m[0]?m[1].$==4?(handler=m[1].$1,{
     $:1,
     $0:AttrModule.Handler(Arrays.get(a,0),handler)
    }):(a$1="Event hole on"+Arrays.get(a,0)+" filled with non-event data",ps=[Arrays.get(a,1)],Global.console.warn.apply(Global.console,[a$1].concat(ps)),null):null;
   },function(a)
   {
    return Arrays.choose(c,a);
   }((_this=e$2.getAttribute("ws-on"),Strings.SplitChars(_this,[32],1))))));
   e$2.removeAttribute("ws-on");
  });
  DomUtility.IterSelector(el,"[ws-onafterrender]",function(e$2)
  {
   var name,m,o,handler;
   name=e$2.getAttribute("ws-onafterrender");
   m=(o=null,[fw.TryGetValue(name,{
    get:function()
    {
     return o;
    },
    set:function(v)
    {
     o=v;
    }
   }),o]);
   m[0]?m[1].$==5?(handler=m[1].$1,e$2.removeAttribute("ws-onafterrender"),addAttr(e$2,AttrModule.OnAfterRender(handler))):Global.console.warn.apply(Global.console,["onafterrender hole filled with non-onafterrender data"].concat([name])):void 0;
  });
  DomUtility.IterSelector(el,"[ws-var]",function(e$2)
  {
   var name,m,o,_var,_var$1,_var$2,_var$3,_var$4,_var$5;
   name=e$2.getAttribute("ws-var");
   e$2.removeAttribute("ws-var");
   m=(o=null,[fw.TryGetValue(name,{
    get:function()
    {
     return o;
    },
    set:function(v)
    {
     o=v;
    }
   }),o]);
   m[0]?m[1].$==6?(_var=m[1].$1,addAttr(e$2,AttrModule.Value(_var))):m[1].$==7?(_var$1=m[1].$1,addAttr(e$2,AttrModule.Checked(_var$1))):m[1].$==8?(_var$2=m[1].$1,addAttr(e$2,AttrModule.IntValue(_var$2))):m[1].$==9?(_var$3=m[1].$1,addAttr(e$2,AttrModule.IntValueUnchecked(_var$3))):m[1].$==10?(_var$4=m[1].$1,addAttr(e$2,AttrModule.FloatValue(_var$4))):m[1].$==11?(_var$5=m[1].$1,addAttr(e$2,AttrModule.FloatValueUnchecked(_var$5))):Global.console.warn.apply(Global.console,["Var hole filled with non-Var data"].concat([name])):void 0;
  });
  DomUtility.IterSelector(el,"[ws-attr-holes]",function(e$2)
  {
   var a,_this,re,holeAttrs,i,$2;
   re=(a=Docs.TextHoleRE(),new Global.RegExp(a,"g"));
   holeAttrs=(_this=e$2.getAttribute("ws-attr-holes"),Strings.SplitChars(_this,[32],1));
   e$2.removeAttribute("ws-attr-holes");
   for(i=0,$2=holeAttrs.length-1;i<=$2;i++)(function()
   {
    var m,lastIndex,$3,finalText,value,s,v1,v2,v3,s$1,vs,v,a$1,s$2,v1$1,v2$1,v$1,s$3,v$2,s$4,attrName,s$5,res,textBefore,v$3;
    attrName=Arrays.get(holeAttrs,i);
    s$5=e$2.getAttribute(attrName);
    m=null;
    lastIndex=0;
    res=[];
    while(m=re.exec(s$5),m!==null)
     {
      textBefore=Slice.string(s$5,{
       $:1,
       $0:lastIndex
      },{
       $:1,
       $0:re.lastIndex-Arrays.get(m,0).length-1
      });
      lastIndex=re.lastIndex;
      v$3=res.push([textBefore,Arrays.get(m,1)]);
     }
    finalText=Slice.string(s$5,{
     $:1,
     $0:lastIndex
    },null);
    re.lastIndex=0;
    value=Arrays.foldBack(function($4,$5)
    {
     return(function(t)
     {
      var textBefore$1,holeName;
      textBefore$1=t[0];
      holeName=t[1];
      return function(t$1)
      {
       var textAfter,views,holeContent,m$1,o,v$4,v$5,v$6,v$7,v$8,v$9,v$10,v$11,v$12,v$13,v$14,v$15;
       textAfter=t$1[0];
       views=t$1[1];
       holeContent=(m$1=(o=null,[fw.TryGetValue(holeName,{
        get:function()
        {
         return o;
        },
        set:function(v$16)
        {
         o=v$16;
        }
       }),o]),m$1[0]?m$1[1].$==1?{
        $:0,
        $0:m$1[1].$1
       }:m$1[1].$==2?{
        $:1,
        $0:m$1[1].$1
       }:m$1[1].$==6?{
        $:1,
        $0:m$1[1].$1.RView()
       }:m$1[1].$==7?(v$4=m$1[1].$1,{
        $:1,
        $0:(v$5=v$4.RView(),View.Map(Global.String,v$5))
       }):m$1[1].$==8?(v$6=m$1[1].$1,{
        $:1,
        $0:(v$7=v$6.RView(),View.Map(function(i$1)
        {
         return i$1.get_Input();
        },v$7))
       }):m$1[1].$==9?(v$8=m$1[1].$1,{
        $:1,
        $0:(v$9=v$8.RView(),View.Map(Global.String,v$9))
       }):m$1[1].$==10?(v$10=m$1[1].$1,{
        $:1,
        $0:(v$11=v$10.RView(),View.Map(function(i$1)
        {
         return i$1.get_Input();
        },v$11))
       }):m$1[1].$==11?(v$12=m$1[1].$1,{
        $:1,
        $0:(v$13=v$12.RView(),View.Map(Global.String,v$13))
       }):(Global.console.warn.apply(Global.console,["Attribute value hole filled with non-text data"].concat([holeName])),{
        $:0,
        $0:""
       }):{
        $:0,
        $0:""
       });
       return holeContent.$==1?(v$14=holeContent.$0,v$15=textAfter===""?v$14:View.Map(function(s$6)
       {
        return s$6+textAfter;
       },v$14),[textBefore$1,new T({
        $:1,
        $0:v$15,
        $1:views
       })]):[textBefore$1+holeContent.$0+textAfter,views];
      };
     }($4))($5);
    },res,[finalText,T.Empty]);
    return addAttr(e$2,value[1].$==1?value[1].$1.$==1?value[1].$1.$1.$==1?value[1].$1.$1.$1.$==0?(s=value[0],v1=value[1].$0,v2=value[1].$1.$0,v3=value[1].$1.$1.$0,AttrModule.Dynamic(attrName,View.Map3(function(v1$2,v2$2,v3$1)
    {
     return s+v1$2+v2$2+v3$1;
    },v1,v2,v3))):(s$1=value[0],vs=value[1],v=(a$1=function(vs$1)
    {
     return s$1+Strings.concat("",vs$1);
    },function(a$2)
    {
     return View.Map(a$1,a$2);
    }(View.Sequence(vs))),AttrModule.Dynamic(attrName,v)):(s$2=value[0],v1$1=value[1].$0,v2$1=value[1].$1.$0,AttrModule.Dynamic(attrName,View.Map2(function(v1$2,v2$2)
    {
     return s$2+v1$2+v2$2;
    },v1$1,v2$1))):value[0]===""?(v$1=value[1].$0,AttrModule.Dynamic(attrName,v$1)):(s$3=value[0],v$2=value[1].$0,AttrModule.Dynamic(attrName,View.Map(function(v$4)
    {
     return s$3+v$4;
    },v$2))):(s$4=value[0],AttrProxy.Create(attrName,s$4)));
   }());
  });
  docTreeNode=(R=afterRender.length==0?null:{
   $:1,
   $0:function(el$1)
   {
    Arrays.iter(function(f)
    {
     f(el$1);
    },afterRender);
   }
  },Runtime.DeleteEmptyFields({
   Els:els,
   Dirty:true,
   Holes:holes,
   Attrs:attrs,
   Render:R?R.$0:void 0
  },["Render"]));
  updates=(d=View.Const(),function(a)
  {
   return Array.TreeReduce(d,View.Map2Unit,a);
  }(updates$1));
  return((els?Arrays.length(els)===1:false)?Arrays.get(els,0)instanceof Global.Node?(e=Arrays.get(els,0),Unchecked.Equals(e.nodeType,Global.Node.ELEMENT_NODE))?($1=Arrays.get(els,0),true):false:false:false)?Elt.TreeNode(docTreeNode,updates):Doc.Mk({
   $:6,
   $0:docTreeNode
  },updates);
 };
 Doc.PrepareTemplateStrict=function(baseName,name,els)
 {
  var convertAttrs,convertTextNode,mapHoles,fillInstanceAttrs,removeHolesExcept,fillTextHole,fill,fakeroot;
  function recF(recI,$1,$2)
  {
   var m,$3,x,a,f,g,v,name$1,name$2,t,instance,usedHoles,mappings,attrs,i,$4,name$3,mappedName,m$1,i$1,$5,n,singleTextFill,i$2,$6,n$1,next;
   while(true)
    switch(recI)
    {
     case 0:
      name$1=Slice.string($1.nodeName,{
       $:1,
       $0:3
      },null).toLowerCase();
      name$2=(m=name$1.indexOf(Global.String.fromCharCode(46)),m===-1?baseName+"/"+name$1:Strings.Replace(name$1,".","/"));
      if(!Docs.LoadedTemplates().ContainsKey(name$2))
       return Global.console.warn.apply(Global.console,["Instantiating non-loaded template"].concat([name$2]));
      else
       {
        t=Docs.LoadedTemplates().get_Item(name$2);
        instance=t.cloneNode(true);
        usedHoles=new HashSet.New$3();
        mappings=new Dictionary.New$5();
        attrs=$1.attributes;
        for(i=0,$4=attrs.length-1;i<=$4;i++){
         name$3=attrs.item(i).name.toLowerCase();
         mappedName=(m$1=attrs.item(i).nodeValue,m$1===""?name$3:m$1.toLowerCase());
         mappings.set_Item(name$3,mappedName);
         !usedHoles.Add(name$3)?Global.console.warn.apply(Global.console,["Hole mapped twice"].concat([name$3])):void 0;
        }
        for(i$1=0,$5=$1.childNodes.length-1;i$1<=$5;i$1++){
         n=$1.childNodes[i$1];
         Unchecked.Equals(n.nodeType,Global.Node.ELEMENT_NODE)?!usedHoles.Add(n.nodeName.toLowerCase())?Global.console.warn.apply(Global.console,["Hole filled twice"].concat([name$2])):void 0:void 0;
        }
        singleTextFill=$1.childNodes.length===1?Unchecked.Equals($1.firstChild.nodeType,Global.Node.TEXT_NODE):false;
        if(singleTextFill)
         {
          x=fillTextHole(instance,$1.firstChild.textContent);
          a=(f=function(usedHoles$1)
          {
           return function(a$1)
           {
            return usedHoles$1.Add(a$1);
           };
          }(usedHoles),g=function()
          {
          },function(x$1)
          {
           return g(f(x$1));
          });
          ((function(a$1)
          {
           return function(o)
           {
            if(o==null)
             ;
            else
             a$1(o.$0);
           };
          }(a))(x));
         }
        removeHolesExcept(instance,usedHoles);
        if(!singleTextFill)
         {
          for(i$2=0,$6=$1.childNodes.length-1;i$2<=$6;i$2++){
           n$1=$1.childNodes[i$2];
           Unchecked.Equals(n$1.nodeType,Global.Node.ELEMENT_NODE)?n$1.hasAttributes()?fillInstanceAttrs(instance,n$1):fillDocHole(instance,n$1):void 0;
          }
         }
        mapHoles(instance,mappings);
        (((function(a$1)
        {
         var c;
         c=function($7,$8)
         {
          return fill(a$1,$7,$8);
         };
         return function($7)
         {
          return function($8)
          {
           return c($7,$8);
          };
         };
        }(instance))($1.parentNode))($1));
        return v=$1.parentNode.removeChild($1);
       }
     case 1:
      if($2!==null)
       {
        next=$2.nextSibling;
        if(Unchecked.Equals($2.nodeType,Global.Node.TEXT_NODE))
         convertTextNode($2);
        else
         if(Unchecked.Equals($2.nodeType,Global.Node.ELEMENT_NODE))
          convertElement($2);
        recI=1;
        $1=$1;
        $2=next;
       }
      else
       return null;
    }
  }
  function fillDocHole(instance,fillWith)
  {
   var m,v,name$1,m$1,v$1;
   function fillHole(p,n)
   {
    var a,v$2,parsed,i,$1,v$3;
    if(name$1==="title"?fillWith.hasChildNodes():false)
     {
      parsed=(a=fillWith.textContent,Global.jQuery.parseHTML(a));
      v$2=fillWith.removeChild(fillWith.firstChild);
      for(i=0,$1=parsed.length-1;i<=$1;i++){
       v$3=fillWith.appendChild(Arrays.get(parsed,i));
      }
     }
    else
     null;
    convertElement(fillWith);
    return fill(fillWith,p,n);
   }
   name$1=fillWith.nodeName.toLowerCase();
   DomUtility.IterSelector(instance,"[ws-attr-holes]",function(e)
   {
    var _this,holeAttrs,i,$1,attrName,_this$1,str,newSubStr;
    holeAttrs=(_this=e.getAttribute("ws-attr-holes"),Strings.SplitChars(_this,[32],1));
    for(i=0,$1=holeAttrs.length-1;i<=$1;i++){
     attrName=Arrays.get(holeAttrs,i);
     e.setAttribute(attrName,(_this$1=new Global.RegExp("\\${"+name$1+"}","ig"),str=e.getAttribute(attrName),newSubStr=fillWith.textContent,_this$1[Global.Symbol.replace](str,newSubStr)));
    }
   });
   m$1=instance.querySelector("[ws-hole="+name$1+"]");
   if(Unchecked.Equals(m$1,null))
    {
     m=instance.querySelector("[ws-replace="+name$1+"]");
     return Unchecked.Equals(m,null)?null:(fillHole(m.parentNode,m),v=m.parentNode.removeChild(m));
    }
   else
    {
     while(m$1.hasChildNodes())
      {
       v$1=m$1.removeChild(m$1.lastChild);
      }
     m$1.removeAttribute("ws-hole");
     return fillHole(m$1,null);
    }
  }
  function convertInstantiation(el)
  {
   return recF(0,el);
  }
  function convertElement(el)
  {
   var _this,m,m$1,v;
   if((_this=el.nodeName.toLowerCase(),Strings.StartsWith(_this,"ws-"))?!el.hasAttribute("ws-template"):false)
    convertInstantiation(el);
   else
    {
     convertAttrs(el);
     m=el.getAttribute("ws-template");
     if(m===null)
      {
       m$1=el.getAttribute("ws-children-template");
       if(m$1===null)
        convert(el,el.firstChild);
       else
        {
         el.removeAttribute("ws-children-template");
         Doc.PrepareTemplate(baseName,{
          $:1,
          $0:m$1
         },function()
         {
          return DomUtility.ChildrenArray(el);
         });
         while(el.hasChildNodes())
          {
           v=el.removeChild(el.lastChild);
          }
        }
      }
     else
      Doc.PrepareSingleTemplate(baseName,{
       $:1,
       $0:m
      },el);
    }
  }
  function convert(p,n)
  {
   return recF(1,p,n);
  }
  convertAttrs=function(el)
  {
   var attrs,toRemove,events,holedAttrs,i,$1,a,_this,v,v$1,_this$1,a$1,_this$2,a$2,str,v$2;
   function lowercaseAttr(name$1)
   {
    var m;
    m=el.getAttribute(name$1);
    m===null?void 0:el.setAttribute(name$1,m.toLowerCase());
   }
   attrs=el.attributes;
   toRemove=[];
   events=[];
   holedAttrs=[];
   for(i=0,$1=attrs.length-1;i<=$1;i++){
    a=attrs.item(i);
    (((_this=a.nodeName,Strings.StartsWith(_this,"ws-on"))?a.nodeName!=="ws-onafterrender":false)?a.nodeName!=="ws-on":false)?(v=toRemove.push(a.nodeName),v$1=events.push(Slice.string(a.nodeName,{
     $:1,
     $0:"ws-on".length
    },null)+":"+a.nodeValue.toLowerCase())):(!(_this$1=a.nodeName,Strings.StartsWith(_this$1,"ws-"))?(a$1=Docs.TextHoleRE(),new Global.RegExp(a$1)).test(a.nodeValue):false)?(a.nodeValue=(_this$2=(a$2=Docs.TextHoleRE(),new Global.RegExp(a$2,"g")),(str=a.nodeValue,_this$2[Global.Symbol.replace](str,function($2,h)
    {
     return"${"+h.toLowerCase()+"}";
    }))),v$2=holedAttrs.push(a.nodeName)):void 0;
   }
   !(events.length==0)?el.setAttribute("ws-on",Strings.concat(" ",events)):void 0;
   !(holedAttrs.length==0)?el.setAttribute("ws-attr-holes",Strings.concat(" ",holedAttrs)):void 0;
   lowercaseAttr("ws-hole");
   lowercaseAttr("ws-replace");
   lowercaseAttr("ws-attr");
   lowercaseAttr("ws-onafterrender");
   lowercaseAttr("ws-var");
   Arrays.iter(function(a$3)
   {
    el.removeAttribute(a$3);
   },toRemove);
  };
  convertTextNode=function(n)
  {
   var m,li,$1,a,s,strRE,v,hole,v$1;
   m=null;
   li=0;
   s=n.textContent;
   strRE=(a=Docs.TextHoleRE(),new Global.RegExp(a,"g"));
   while(m=strRE.exec(s),m!==null)
    {
     v=n.parentNode.insertBefore(Global.document.createTextNode(Slice.string(s,{
      $:1,
      $0:li
     },{
      $:1,
      $0:strRE.lastIndex-Arrays.get(m,0).length-1
     })),n);
     li=strRE.lastIndex;
     hole=Global.document.createElement("span");
     hole.setAttribute("ws-replace",Arrays.get(m,1).toLowerCase());
     v$1=n.parentNode.insertBefore(hole,n);
    }
   strRE.lastIndex=0;
   n.textContent=Slice.string(s,{
    $:1,
    $0:li
   },null);
  };
  mapHoles=function(t,mappings)
  {
   function run(attrName)
   {
    DomUtility.IterSelector(t,"["+attrName+"]",function(e)
    {
     var m,o;
     m=(o=null,[mappings.TryGetValue(e.getAttribute(attrName).toLowerCase(),{
      get:function()
      {
       return o;
      },
      set:function(v)
      {
       o=v;
      }
     }),o]);
     m[0]?e.setAttribute(attrName,m[1]):void 0;
    });
   }
   run("ws-hole");
   run("ws-replace");
   run("ws-attr");
   run("ws-onafterrender");
   run("ws-var");
   DomUtility.IterSelector(t,"[ws-on]",function(e)
   {
    var s,m,_this;
    e.setAttribute("ws-on",(s=(m=function(x)
    {
     var a,m$1,o,x$1;
     a=Strings.SplitChars(x,[58],1);
     m$1=(o=null,[mappings.TryGetValue(Arrays.get(a,1),{
      get:function()
      {
       return o;
      },
      set:function(v)
      {
       o=v;
      }
     }),o]);
     return m$1[0]?(x$1=m$1[1],Arrays.get(a,0)+":"+x$1):x;
    },function(a)
    {
     return Arrays.map(m,a);
    }((_this=e.getAttribute("ws-on"),Strings.SplitChars(_this,[32],1)))),Strings.concat(" ",s)));
   });
   return DomUtility.IterSelector(t,"[ws-attr-holes]",function(e)
   {
    var _this,holeAttrs,i,$1;
    holeAttrs=(_this=e.getAttribute("ws-attr-holes"),Strings.SplitChars(_this,[32],1));
    for(i=0,$1=holeAttrs.length-1;i<=$1;i++)(function()
    {
     var attrName,x,f;
     attrName=Arrays.get(holeAttrs,i);
     return e.setAttribute(attrName,(x=e.getAttribute(attrName),((f=function(s,a)
     {
      var a$1,m,a$2,_this$1;
      a$1=Operators.KeyValue(a);
      m=a$1[1];
      a$2=a$1[0];
      _this$1=new Global.RegExp("\\${"+a$2+"}","ig");
      return _this$1[Global.Symbol.replace](s,"${"+m+"}");
     },(Runtime.Curried3(Seq.fold))(f))(x))(mappings)));
    }());
   });
  };
  fillInstanceAttrs=function(instance,fillWith)
  {
   var name$1,m,i,$1,a;
   convertAttrs(fillWith);
   name$1=fillWith.nodeName.toLowerCase();
   m=instance.querySelector("[ws-attr="+name$1+"]");
   if(Unchecked.Equals(m,null))
    return Global.console.warn.apply(Global.console,["Filling non-existent attr hole"].concat([name$1]));
   else
    {
     m.removeAttribute("ws-attr");
     for(i=0,$1=fillWith.attributes.length-1;i<=$1;i++){
      a=fillWith.attributes.item(i);
      (a.name==="class"?m.hasAttribute("class"):false)?m.setAttribute("class",m.getAttribute("class")+" "+a.nodeValue):m.setAttribute(a.name,a.nodeValue);
     }
     return;
    }
  };
  removeHolesExcept=function(instance,dontRemove)
  {
   function run(attrName)
   {
    DomUtility.IterSelector(instance,"["+attrName+"]",function(e)
    {
     if(!dontRemove.Contains(e.getAttribute(attrName)))
      e.removeAttribute(attrName);
    });
   }
   run("ws-attr");
   run("ws-onafterrender");
   run("ws-var");
   DomUtility.IterSelector(instance,"[ws-hole]",function(e)
   {
    var v;
    if(!dontRemove.Contains(e.getAttribute("ws-hole")))
     {
      e.removeAttribute("ws-hole");
      while(e.hasChildNodes())
       {
        v=e.removeChild(e.lastChild);
       }
     }
   });
   DomUtility.IterSelector(instance,"[ws-replace]",function(e)
   {
    var v;
    if(!dontRemove.Contains(e.getAttribute("ws-replace")))
     {
      v=e.parentNode.removeChild(e);
     }
   });
   DomUtility.IterSelector(instance,"[ws-on]",function(e)
   {
    var s,p,_this;
    e.setAttribute("ws-on",(s=(p=function(x)
    {
     var a;
     a=Strings.SplitChars(x,[58],1);
     return dontRemove.Contains(Arrays.get(a,1));
    },function(a)
    {
     return Arrays.filter(p,a);
    }((_this=e.getAttribute("ws-on"),Strings.SplitChars(_this,[32],1)))),Strings.concat(" ",s)));
   });
   return DomUtility.IterSelector(instance,"[ws-attr-holes]",function(e)
   {
    var _this,holeAttrs,i,$1,attrName,_this$1,a,str;
    holeAttrs=(_this=e.getAttribute("ws-attr-holes"),Strings.SplitChars(_this,[32],1));
    for(i=0,$1=holeAttrs.length-1;i<=$1;i++){
     attrName=Arrays.get(holeAttrs,i);
     e.setAttribute(attrName,(_this$1=(a=Docs.TextHoleRE(),new Global.RegExp(a,"g")),(str=e.getAttribute(attrName),_this$1[Global.Symbol.replace](str,function(full,h)
     {
      return dontRemove.Contains(h)?full:"";
     }))));
    }
   });
  };
  fillTextHole=function(instance,fillWith)
  {
   var m,v;
   m=instance.querySelector("[ws-replace]");
   return Unchecked.Equals(m,null)?(Global.console.warn.apply(Global.console,["Filling non-existent text hole"].concat([name])),null):(v=m.parentNode.replaceChild(new Global.Text(fillWith),m),{
    $:1,
    $0:m.getAttribute("ws-replace")
   });
  };
  fill=function(fillWith,p,n)
  {
   while(true)
    if(fillWith.hasChildNodes())
     n=p.insertBefore(fillWith.lastChild,n);
    else
     return null;
  };
  fakeroot=Doc.FakeRoot(els);
  Docs.LoadedTemplates().set_Item(Doc.ComposeName(baseName,name),fakeroot);
  Arrays.length(els)>0?convert(fakeroot,Arrays.get(els,0)):void 0;
 };
 Doc.TextNode=function(v)
 {
  var a,a$1;
  a={
   $:5,
   $0:DomUtility.CreateText(v)
  };
  a$1=View.Const();
  return Doc.Mk(a,a$1);
 };
 Doc.TextView=function(txt)
 {
  var node,a,a$1;
  node=Docs.CreateTextNode();
  a={
   $:4,
   $0:node
  };
  return function(a$2)
  {
   return Doc.Mk(a,a$2);
  }((a$1=function(t)
  {
   Docs.UpdateTextNode(node,t);
  },function(a$2)
  {
   return View.Map(a$1,a$2);
  }(txt)));
 };
 Doc.FakeRoot=function(els)
 {
  var fakeroot,i,$1,v;
  fakeroot=Global.document.createElement("div");
  for(i=0,$1=els.length-1;i<=$1;i++){
   v=fakeroot.appendChild(Arrays.get(els,i));
  }
  return fakeroot;
 };
 Doc.New=Runtime.Ctor(function(docNode,updates)
 {
  this.docNode=docNode;
  this.updates=updates;
 },Doc);
 Arrays.get=function(arr,n)
 {
  Arrays.checkBounds(arr,n);
  return arr[n];
 };
 Arrays.length=function(arr)
 {
  return arr.dims===2?arr.length*arr.length:arr.length;
 };
 Arrays.checkBounds=function(arr,n)
 {
  if(n<0?true:n>=arr.length)
   Operators.FailWith("Index was outside the bounds of the array.");
 };
 Arrays.set=function(arr,n,x)
 {
  Arrays.checkBounds(arr,n);
  arr[n]=x;
 };
 WebSharper$JsPDF$Sample_Templates.main=function(h)
 {
  Doc.LoadLocalTemplates("index");
  return h?Doc.NamedTemplate("index",{
   $:1,
   $0:"main"
  },h):void 0;
 };
 AttrProxy=Next.AttrProxy=Runtime.Class({},null,AttrProxy);
 AttrProxy.Create=function(name,value)
 {
  return Attrs.Static(function(el)
  {
   DomUtility.SetAttr(el,name,value);
  });
 };
 AttrProxy.Concat=function(xs)
 {
  var x,d;
  x=Array.ofSeqNonCopying(xs);
  d=Attrs.EmptyAttr();
  return Array.TreeReduce(d,AttrProxy.Append,x);
 };
 AttrProxy.Append=function(a,b)
 {
  return Attrs.AppendTree(a,b);
 };
 Pervasives.NewFromSeq=function(fields)
 {
  var r,e,f;
  r={};
  e=Enumerator.Get(fields);
  try
  {
   while(e.MoveNext())
    {
     f=e.Current();
     r[f[0]]=f[1];
    }
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
  return r;
 };
 DomUtility.CreateElement=function(name)
 {
  return DomUtility.Doc().createElement(name);
 };
 DomUtility.SetAttr=function(el,name,value)
 {
  el.setAttribute(name,value);
 };
 DomUtility.Doc=function()
 {
  SC$1.$cctor();
  return SC$1.Doc;
 };
 DomUtility.ChildrenArray=function(element)
 {
  var a,i,$1,v;
  a=[];
  for(i=0,$1=element.childNodes.length-1;i<=$1;i++){
   v=a.push(element.childNodes[i]);
  }
  return a;
 };
 DomUtility.IterSelector=function(el,selector,f)
 {
  var l,i,$1;
  l=el.querySelectorAll(selector);
  for(i=0,$1=l.length-1;i<=$1;i++)f(l[i]);
 };
 DomUtility.CreateText=function(s)
 {
  return DomUtility.Doc().createTextNode(s);
 };
 DomUtility.InsertAt=function(parent,pos,node)
 {
  var m,v;
  !(node.parentNode===parent?pos===(m=node.nextSibling,Unchecked.Equals(m,null)?null:m):false)?v=parent.insertBefore(node,pos):void 0;
 };
 DomUtility.RemoveNode=function(parent,el)
 {
  var v;
  if(el.parentNode===parent)
   {
    v=parent.removeChild(el);
   }
 };
 Attrs.Static=function(attr$1)
 {
  return new AttrProxy({
   $:3,
   $0:attr$1
  });
 };
 Attrs.EmptyAttr=function()
 {
  SC$2.$cctor();
  return SC$2.EmptyAttr;
 };
 Attrs.AppendTree=function(a,b)
 {
  var x;
  return a===null?b:b===null?a:(x=new AttrProxy({
   $:2,
   $0:a,
   $1:b
  }),(Attrs.SetFlags(x,Attrs.Flags(a)|Attrs.Flags(b)),x));
 };
 Attrs.Updates=function(dyn)
 {
  var x,d;
  x=dyn.DynNodes;
  d=View.Const();
  return Array.MapTreeReduce(function(x$1)
  {
   return x$1.NChanged();
  },d,View.Map2Unit,x);
 };
 Attrs.SetFlags=function(a,f)
 {
  a.flags=f;
 };
 Attrs.Flags=function(a)
 {
  return(a!==null?a.hasOwnProperty("flags"):false)?a.flags:0;
 };
 Attrs.Insert=function(elem,tree)
 {
  var nodes,oar,arr;
  function loop(node)
  {
   var b;
   if(!(node===null))
    if(node!=null?node.$==1:false)
     nodes.push(node.$0);
    else
     if(node!=null?node.$==2:false)
      {
       b=node.$1;
       loop(node.$0);
       loop(b);
      }
     else
      if(node!=null?node.$==3:false)
       node.$0(elem);
      else
       if(node!=null?node.$==4:false)
        oar.push(node.$0);
  }
  nodes=[];
  oar=[];
  loop(tree);
  arr=nodes.slice(0);
  return Dyn.New(elem,Attrs.Flags(tree),arr,oar.length===0?null:{
   $:1,
   $0:function(el)
   {
    Seq.iter(function(f)
    {
     f(el);
    },oar);
   }
  });
 };
 Attrs.Empty=function(e)
 {
  return Dyn.New(e,0,[],null);
 };
 Attrs.Dynamic=function(view,set)
 {
  return new AttrProxy({
   $:1,
   $0:new DynamicAttrNode.New(view,set)
  });
 };
 Attrs.HasChangeAnim=function(attr$1)
 {
  var flag;
  flag=4;
  return(attr$1.DynFlags&flag)===flag;
 };
 Attrs.GetChangeAnim=function(dyn)
 {
  return Attrs.GetAnim(dyn,function($1,$2)
  {
   return $1.NGetChangeAnim($2);
  });
 };
 Attrs.HasEnterAnim=function(attr$1)
 {
  var flag;
  flag=1;
  return(attr$1.DynFlags&flag)===flag;
 };
 Attrs.GetEnterAnim=function(dyn)
 {
  return Attrs.GetAnim(dyn,function($1,$2)
  {
   return $1.NGetEnterAnim($2);
  });
 };
 Attrs.HasExitAnim=function(attr$1)
 {
  var flag;
  flag=2;
  return(attr$1.DynFlags&flag)===flag;
 };
 Attrs.GetExitAnim=function(dyn)
 {
  return Attrs.GetAnim(dyn,function($1,$2)
  {
   return $1.NGetExitAnim($2);
  });
 };
 Attrs.GetAnim=function(dyn,f)
 {
  var m;
  return An.Concat((m=function(n)
  {
   return f(n,dyn.DynElem);
  },function(a)
  {
   return Arrays.map(m,a);
  }(dyn.DynNodes)));
 };
 Attrs.Sync=function(elem,dyn)
 {
  var a;
  a=function(d)
  {
   d.NSync(elem);
  };
  (function(a$1)
  {
   Arrays.iter(a,a$1);
  }(dyn.DynNodes));
 };
 DocNode.EmptyDoc={
  $:3
 };
 Array.ofSeqNonCopying=function(xs)
 {
  var q,o,v;
  if(xs instanceof Global.Array)
   return xs;
  else
   if(xs instanceof T)
    return Arrays.ofList(xs);
   else
    if(xs===null)
     return[];
    else
     {
      q=[];
      o=Enumerator.Get(xs);
      try
      {
       while(o.MoveNext())
        {
         v=q.push(o.Current());
        }
       return q;
      }
      finally
      {
       if("Dispose"in o)
        o.Dispose();
      }
     }
 };
 Array.TreeReduce=function(defaultValue,reduction,array)
 {
  var l;
  function loop(off,len)
  {
   var $1,l2;
   return len<=0?defaultValue:(len===1?(off>=0?off<l:false)?true:false:false)?Arrays.get(array,off):(l2=len/2>>0,reduction(loop(off,l2),loop(off+l2,len-l2)));
  }
  l=Arrays.length(array);
  return loop(0,l);
 };
 Array.MapTreeReduce=function(mapping,defaultValue,reduction,array)
 {
  var l;
  function loop(off,len)
  {
   var $1,l2;
   return len<=0?defaultValue:(len===1?(off>=0?off<l:false)?true:false:false)?mapping(Arrays.get(array,off)):(l2=len/2>>0,reduction(loop(off,l2),loop(off+l2,len-l2)));
  }
  l=Arrays.length(array);
  return loop(0,l);
 };
 Elt=Next.Elt=Runtime.Class({},Doc,Elt);
 Elt.New=function(el,attr$1,children)
 {
  var node,rvUpdates,attrUpdates,updates,a;
  node=Docs.CreateElemNode(el,attr$1,children.docNode);
  rvUpdates=Var.Create$1(children.updates);
  attrUpdates=Attrs.Updates(node.Attr);
  updates=(a=rvUpdates.v,View.Bind(function(a$1)
  {
   return View.Map2Unit(attrUpdates,a$1);
  },a));
  return new Elt.New$1({
   $:1,
   $0:node
  },updates,el,rvUpdates);
 };
 Elt.TreeNode=function(tree,updates)
 {
  var rvUpdates,attrUpdates,x,m,f,d,updates$1,a;
  rvUpdates=Var.Create$1(updates);
  attrUpdates=(x=(m=(f=function(t)
  {
   return t[1];
  },function(x$1)
  {
   return Attrs.Updates(f(x$1));
  }),function(a$1)
  {
   return Arrays.map(m,a$1);
  }(tree.Attrs)),(d=View.Const(),Array.TreeReduce(d,View.Map2Unit,x)));
  updates$1=(a=rvUpdates.v,View.Bind(function(a$1)
  {
   return View.Map2Unit(attrUpdates,a$1);
  },a));
  return new Elt.New$1({
   $:6,
   $0:tree
  },updates$1,Arrays.get(tree.Els,0),rvUpdates);
 };
 Elt.New$1=Runtime.Ctor(function(docNode,updates,elt,rvUpdates)
 {
  Doc.New.call(this,docNode,updates);
  this.docNode$1=docNode;
  this.updates$1=updates;
  this.elt=elt;
  this.rvUpdates=rvUpdates;
 },Elt);
 Unchecked.Equals=function(a,b)
 {
  var m,eqR,k,k$1;
  if(a===b)
   return true;
  else
   {
    m=typeof a;
    if(m=="object")
    {
     if(((a===null?true:a===void 0)?true:b===null)?true:b===void 0)
      return false;
     else
      if("Equals"in a)
       return a.Equals(b);
      else
       if(a instanceof Global.Array?b instanceof Global.Array:false)
        return Unchecked.arrayEquals(a,b);
       else
        if(a instanceof Global.Date?b instanceof Global.Date:false)
         return Unchecked.dateEquals(a,b);
        else
         {
          eqR=[true];
          for(var k$2 in a)if(function(k$3)
          {
           eqR[0]=!a.hasOwnProperty(k$3)?true:b.hasOwnProperty(k$3)?Unchecked.Equals(a[k$3],b[k$3]):false;
           return!eqR[0];
          }(k$2))
           break;
          if(eqR[0])
           {
            for(var k$3 in b)if(function(k$4)
            {
             eqR[0]=!b.hasOwnProperty(k$4)?true:a.hasOwnProperty(k$4);
             return!eqR[0];
            }(k$3))
             break;
           }
          return eqR[0];
         }
    }
    else
     return m=="function"?"$Func"in a?a.$Func===b.$Func?a.$Target===b.$Target:false:("$Invokes"in a?"$Invokes"in b:false)?Unchecked.arrayEquals(a.$Invokes,b.$Invokes):false:false;
   }
 };
 Unchecked.arrayEquals=function(a,b)
 {
  var eq,i;
  if(Arrays.length(a)===Arrays.length(b))
   {
    eq=true;
    i=0;
    while(eq?i<Arrays.length(a):false)
     {
      !Unchecked.Equals(Arrays.get(a,i),Arrays.get(b,i))?eq=false:void 0;
      i=i+1;
     }
    return eq;
   }
  else
   return false;
 };
 Unchecked.dateEquals=function(a,b)
 {
  return a.getTime()===b.getTime();
 };
 Unchecked.Hash=function(o)
 {
  var m;
  m=typeof o;
  return m=="function"?0:m=="boolean"?o?1:0:m=="number"?o:m=="string"?Unchecked.hashString(o):m=="object"?o==null?0:o instanceof Global.Array?Unchecked.hashArray(o):Unchecked.hashObject(o):0;
 };
 Unchecked.hashString=function(s)
 {
  var hash,i,$1;
  if(s===null)
   return 0;
  else
   {
    hash=5381;
    for(i=0,$1=s.length-1;i<=$1;i++)hash=Unchecked.hashMix(hash,s.charCodeAt(i)<<0);
    return hash;
   }
 };
 Unchecked.hashArray=function(o)
 {
  var h,i,$1;
  h=-34948909;
  for(i=0,$1=Arrays.length(o)-1;i<=$1;i++)h=Unchecked.hashMix(h,Unchecked.Hash(Arrays.get(o,i)));
  return h;
 };
 Unchecked.hashObject=function(o)
 {
  var _,h,k;
  if("GetHashCode"in o)
   return o.GetHashCode();
  else
   {
    _=Unchecked.hashMix;
    h=[0];
    for(var k$1 in o)if(function(key)
    {
     h[0]=_(_(h[0],Unchecked.hashString(key)),Unchecked.Hash(o[key]));
     return false;
    }(k$1))
     break;
    return h[0];
   }
 };
 Unchecked.hashMix=function(x,y)
 {
  return(x<<5)+x+y;
 };
 Unchecked.Compare=function(a,b)
 {
  var $1,m,$2,cmp,k,k$1;
  if(a===b)
   return 0;
  else
   {
    m=typeof a;
    switch(m=="function"?1:m=="boolean"?2:m=="number"?2:m=="string"?2:m=="object"?3:0)
    {
     case 0:
      return typeof b=="undefined"?0:-1;
      break;
     case 1:
      return Operators.FailWith("Cannot compare function values.");
      break;
     case 2:
      return a<b?-1:1;
      break;
     case 3:
      if(a===null)
       $2=-1;
      else
       if(b===null)
        $2=1;
       else
        if("CompareTo"in a)
         $2=a.CompareTo(b);
        else
         if("CompareTo0"in a)
          $2=a.CompareTo0(b);
         else
          if(a instanceof Global.Array?b instanceof Global.Array:false)
           $2=Unchecked.compareArrays(a,b);
          else
           if(a instanceof Global.Date?b instanceof Global.Date:false)
            $2=Unchecked.compareDates(a,b);
           else
            {
             cmp=[0];
             for(var k$2 in a)if(function(k$3)
             {
              return!a.hasOwnProperty(k$3)?false:!b.hasOwnProperty(k$3)?(cmp[0]=1,true):(cmp[0]=Unchecked.Compare(a[k$3],b[k$3]),cmp[0]!==0);
             }(k$2))
              break;
             if(cmp[0]===0)
              {
               for(var k$3 in b)if(function(k$4)
               {
                return!b.hasOwnProperty(k$4)?false:!a.hasOwnProperty(k$4)?(cmp[0]=-1,true):false;
               }(k$3))
                break;
              }
             $2=cmp[0];
            }
      return $2;
      break;
    }
   }
 };
 Unchecked.compareArrays=function(a,b)
 {
  var cmp,i;
  if(Arrays.length(a)<Arrays.length(b))
   return -1;
  else
   if(Arrays.length(a)>Arrays.length(b))
    return 1;
   else
    {
     cmp=0;
     i=0;
     while(cmp===0?i<Arrays.length(a):false)
      {
       cmp=Unchecked.Compare(Arrays.get(a,i),Arrays.get(b,i));
       i=i+1;
      }
     return cmp;
    }
 };
 Unchecked.compareDates=function(a,b)
 {
  return Operators.Compare(a.getTime(),b.getTime());
 };
 Arrays.ofList=function(xs)
 {
  var l,q;
  q=[];
  l=xs;
  while(!(l.$==0))
   {
    q.push(List.head(l));
    l=List.tail(l);
   }
  return q;
 };
 Arrays.tryPick=function(f,arr)
 {
  var res,i,m;
  res=null;
  i=0;
  while(i<arr.length?res==null:false)
   {
    m=f(arr[i]);
    (m!=null?m.$==1:false)?res=m:void 0;
    i=i+1;
   }
  return res;
 };
 Arrays.tryFindIndex=function(f,arr)
 {
  var res,i;
  res=null;
  i=0;
  while(i<arr.length?res==null:false)
   {
    f(arr[i])?res={
     $:1,
     $0:i
    }:void 0;
    i=i+1;
   }
  return res;
 };
 Arrays.choose=function(f,arr)
 {
  var q,i,$1,m;
  q=[];
  for(i=0,$1=arr.length-1;i<=$1;i++){
   m=f(arr[i]);
   m==null?void 0:q.push(m.$0);
  }
  return q;
 };
 Arrays.foldBack=function(f,arr,zero)
 {
  var acc,$1,len,i,$2;
  acc=zero;
  len=arr.length;
  for(i=1,$2=len;i<=$2;i++)acc=f(arr[len-i],acc);
  return acc;
 };
 Arrays.iter=function(f,arr)
 {
  var i,$1;
  for(i=0,$1=arr.length-1;i<=$1;i++)f(arr[i]);
 };
 Arrays.exists=function(f,x)
 {
  var e,i,$1,l;
  e=false;
  i=0;
  l=Arrays.length(x);
  while(!e?i<l:false)
   if(f(x[i]))
    e=true;
   else
    i=i+1;
  return e;
 };
 Arrays.map=function(f,arr)
 {
  var a,r,i,$1;
  r=(a=arr.length,new Global.Array(a));
  for(i=0,$1=arr.length-1;i<=$1;i++)r[i]=f(arr[i]);
  return r;
 };
 Arrays.filter=function(f,arr)
 {
  var r,i,$1;
  r=[];
  for(i=0,$1=arr.length-1;i<=$1;i++)if(f(arr[i]))
   r.push(arr[i]);
  return r;
 };
 Arrays.ofSeq=function(xs)
 {
  var q,o;
  if(xs instanceof Global.Array)
   return xs.slice();
  else
   if(xs instanceof T)
    return Arrays.ofList(xs);
   else
    {
     q=[];
     o=Enumerator.Get(xs);
     try
     {
      while(o.MoveNext())
       q.push(o.Current());
      return q;
     }
     finally
     {
      if("Dispose"in o)
       o.Dispose();
     }
    }
 };
 Arrays.forall=function(f,x)
 {
  var a,i,$1,l;
  a=true;
  i=0;
  l=Arrays.length(x);
  while(a?i<l:false)
   if(f(x[i]))
    i=i+1;
   else
    a=false;
  return a;
 };
 Arrays.concat=function(xs)
 {
  var x;
  x=Arrays.ofSeq(xs);
  return Global.Array.prototype.concat.apply([],x);
 };
 Arrays.pick=function(f,arr)
 {
  var m;
  m=Arrays.tryPick(f,arr);
  return m==null?Operators.FailWith("KeyNotFoundException"):m.$0;
 };
 Arrays.create=function(size,value)
 {
  var r,i,$1;
  r=new Global.Array(size);
  for(i=0,$1=size-1;i<=$1;i++)r[i]=value;
  return r;
 };
 Arrays.init=function(size,f)
 {
  var r,i,$1;
  size<0?Operators.FailWith("Negative size given."):null;
  r=new Global.Array(size);
  for(i=0,$1=size-1;i<=$1;i++)r[i]=f(i);
  return r;
 };
 DocElemNode=Next.DocElemNode=Runtime.Class({
  Equals:function(o)
  {
   return this.ElKey===o.ElKey;
  },
  GetHashCode:function()
  {
   return this.ElKey;
  }
 },null,DocElemNode);
 DocElemNode.New=function(Attr,Children,Delimiters,El,ElKey,Render)
 {
  var $1;
  return new DocElemNode(($1={
   Attr:Attr,
   Children:Children,
   El:El,
   ElKey:ElKey
  },(Runtime.SetOptional($1,"Delimiters",Delimiters),Runtime.SetOptional($1,"Render",Render),$1)));
 };
 View.Const=function(x)
 {
  var o;
  o=Snap.CreateForever(x);
  return function()
  {
   return o;
  };
 };
 View.Map2Unit=function(a,a$1)
 {
  return View.CreateLazy(function()
  {
   var s1,s2;
   s1=a();
   s2=a$1();
   return Snap.Map2Unit(s1,s2);
  });
 };
 View.Bind=function(fn,view)
 {
  return View.Join(View.Map(fn,view));
 };
 View.Sink=function(act,a)
 {
  function loop()
  {
   var sn;
   sn=a();
   Snap.When(sn,act,function()
   {
    Async.Schedule(loop);
   });
  }
  Async.Schedule(loop);
 };
 View.CreateLazy=function(observe)
 {
  var lv;
  lv={
   c:null,
   o:observe
  };
  return function()
  {
   var c;
   c=lv.c;
   return c===null?(c=lv.o(),lv.c=c,Snap.IsForever(c)?lv.o=null:Snap.WhenObsolete(c,function()
   {
    lv.c=null;
   }),c):c;
  };
 };
 View.Join=function(a)
 {
  return View.CreateLazy(function()
  {
   return Snap.Join(a());
  });
 };
 View.Map=function(fn,a)
 {
  return View.CreateLazy(function()
  {
   var a$1;
   a$1=a();
   return Snap.Map(fn,a$1);
  });
 };
 View.Map3=function(fn,a,a$1,a$2)
 {
  return View.CreateLazy(function()
  {
   var s1,s2,s3;
   s1=a();
   s2=a$1();
   s3=a$2();
   return Snap.Map3(fn,s1,s2,s3);
  });
 };
 View.Sequence=function(views)
 {
  return View.CreateLazy(function()
  {
   var m;
   return Snap.Sequence((m=function(a)
   {
    return a();
   },function(s)
   {
    return Seq.map(m,s);
   }(views)));
  });
 };
 View.Map2=function(fn,a,a$1)
 {
  return View.CreateLazy(function()
  {
   var s1,s2;
   s1=a();
   s2=a$1();
   return Snap.Map2(fn,s1,s2);
  });
 };
 SC$1.$cctor=Runtime.Cctor(function()
 {
  SC$1.Doc=Global.document;
  SC$1.$cctor=Global.ignore;
 });
 Docs.CreateElemNode=function(el,attr$1,children)
 {
  var attr$2;
  Docs.LinkElement(el,children);
  attr$2=Attrs.Insert(el,attr$1);
  return DocElemNode.New(attr$2,children,null,el,Fresh.Int(),Runtime.GetOptional(attr$2.OnAfterRender));
 };
 Docs.LoadedTemplates=function()
 {
  SC$3.$cctor();
  return SC$3.LoadedTemplates;
 };
 Docs.LinkElement=function(el,children)
 {
  var v;
  v=Docs.InsertDoc(el,children,null);
 };
 Docs.CreateRunState=function(parent,doc)
 {
  return RunState.New(NodeSet.get_Empty(),Docs.CreateElemNode(parent,Attrs.EmptyAttr(),doc));
 };
 Docs.PerformAnimatedUpdate=function(st,doc)
 {
  var a;
  return An.get_UseAnimations()?Concurrency.Delay(function()
  {
   var cur,change,enter,exit,x;
   cur=NodeSet.FindAll(doc);
   change=Docs.ComputeChangeAnim(st,cur);
   enter=Docs.ComputeEnterAnim(st,cur);
   exit=Docs.ComputeExitAnim(st,cur);
   x=An.Play(An.Append(change,exit));
   return Concurrency.Bind(x,function()
   {
    Docs.SyncElemNode(st.Top);
    return Concurrency.Bind(An.Play(enter),function()
    {
     st.PreviousNodes=cur;
     return Concurrency.Return(null);
    });
   });
  }):(a=function(ok)
  {
   var v;
   v=Global.requestAnimationFrame(function()
   {
    Docs.SyncElemNode(st.Top);
    ok();
   });
  },Concurrency.FromContinuations(function($1,$2,$3)
  {
   return a.apply(null,[$1,$2,$3]);
  }));
 };
 Docs.InsertBeforeDelim=function(afterDelim,doc)
 {
  var p,before,v;
  p=afterDelim.parentNode;
  before=Global.document.createTextNode("");
  v=p.insertBefore(before,afterDelim);
  Docs.LinkPrevElement(afterDelim,doc);
  return before;
 };
 Docs.TextHoleRE=function()
 {
  SC$3.$cctor();
  return SC$3.TextHoleRE;
 };
 Docs.InsertDoc=function(parent,doc,pos)
 {
  var e,d,t,t$1,t$2,b,a;
  return doc.$==1?(e=doc.$0,Docs.InsertNode(parent,e.El,pos)):doc.$==2?(d=doc.$0,(d.Dirty=false,Docs.InsertDoc(parent,d.Current,pos))):doc.$==3?pos:doc.$==4?(t=doc.$0,Docs.InsertNode(parent,t.Text,pos)):doc.$==5?(t$1=doc.$0,Docs.InsertNode(parent,t$1,pos)):doc.$==6?(t$2=doc.$0,Arrays.foldBack(function($1,$2)
  {
   return $1.constructor===Global.Object?Docs.InsertDoc(parent,$1,$2):Docs.InsertNode(parent,$1,$2);
  },t$2.Els,pos)):(b=doc.$1,(a=doc.$0,Docs.InsertDoc(parent,a,Docs.InsertDoc(parent,b,pos))));
 };
 Docs.ComputeChangeAnim=function(st,cur)
 {
  var relevant,a,m,a$1,a$2;
  relevant=(a=function(n)
  {
   return Attrs.HasChangeAnim(n.Attr);
  },function(a$3)
  {
   return NodeSet.Filter(a,a$3);
  });
  return An.Concat((m=function(n)
  {
   return Attrs.GetChangeAnim(n.Attr);
  },function(a$3)
  {
   return Arrays.map(m,a$3);
  }(NodeSet.ToArray((a$1=relevant(st.PreviousNodes),(a$2=relevant(cur),NodeSet.Intersect(a$1,a$2)))))));
 };
 Docs.ComputeEnterAnim=function(st,cur)
 {
  var m,x,a,a$1;
  return An.Concat((m=function(n)
  {
   return Attrs.GetEnterAnim(n.Attr);
  },function(a$2)
  {
   return Arrays.map(m,a$2);
  }(NodeSet.ToArray((x=(a=function(n)
  {
   return Attrs.HasEnterAnim(n.Attr);
  },function(a$2)
  {
   return NodeSet.Filter(a,a$2);
  }(cur)),(a$1=st.PreviousNodes,NodeSet.Except(a$1,x)))))));
 };
 Docs.ComputeExitAnim=function(st,cur)
 {
  var m,a,a$1;
  return An.Concat((m=function(n)
  {
   return Attrs.GetExitAnim(n.Attr);
  },function(a$2)
  {
   return Arrays.map(m,a$2);
  }(NodeSet.ToArray((a=(a$1=function(n)
  {
   return Attrs.HasExitAnim(n.Attr);
  },function(a$2)
  {
   return NodeSet.Filter(a$1,a$2);
  }(st.PreviousNodes)),NodeSet.Except(cur,a))))));
 };
 Docs.SyncElemNode=function(el)
 {
  Docs.SyncElement(el);
  Docs.Sync(el.Children);
  Docs.AfterRender(el);
 };
 Docs.CreateTextNode=function()
 {
  return{
   Text:DomUtility.CreateText(""),
   Dirty:false,
   Value:""
  };
 };
 Docs.UpdateTextNode=function(n,t)
 {
  n.Value=t;
  n.Dirty=true;
 };
 Docs.LinkPrevElement=function(el,children)
 {
  var v;
  v=Docs.InsertDoc(el.parentNode,children,el);
 };
 Docs.InsertNode=function(parent,node,pos)
 {
  DomUtility.InsertAt(parent,pos,node);
  return node;
 };
 Docs.SyncElement=function(el)
 {
  function hasDirtyChildren(el$1)
  {
   function dirty(doc)
   {
    var b,d,t;
    return doc.$==0?(b=doc.$1,dirty(doc.$0)?true:dirty(b)):doc.$==2?(d=doc.$0,d.Dirty?true:dirty(d.Current)):doc.$==6?(t=doc.$0,t.Dirty?true:Arrays.exists(hasDirtyChildren,t.Holes)):false;
   }
   return dirty(el$1.Children);
  }
  Attrs.Sync(el.El,el.Attr);
  hasDirtyChildren(el)?Docs.DoSyncElement(el):void 0;
 };
 Docs.Sync=function(doc)
 {
  var n,d,t,b,a;
  if(doc.$==1)
   Docs.SyncElemNode(doc.$0);
  else
   if(doc.$==2)
    {
     n=doc.$0;
     Docs.Sync(n.Current);
    }
   else
    if(doc.$==3)
     ;
    else
     if(doc.$==5)
      ;
     else
      if(doc.$==4)
       {
        d=doc.$0;
        d.Dirty?(d.Text.nodeValue=d.Value,d.Dirty=false):void 0;
       }
      else
       if(doc.$==6)
        {
         t=doc.$0;
         Arrays.iter(function(e)
         {
          Docs.SyncElemNode(e);
         },t.Holes);
         Arrays.iter(function(t$1)
         {
          var e,a$1;
          e=t$1[0];
          a$1=t$1[1];
          Attrs.Sync(e,a$1);
         },t.Attrs);
         Docs.AfterRender(t);
        }
       else
        {
         b=doc.$1;
         a=doc.$0;
         Docs.Sync(a);
         Docs.Sync(b);
        }
 };
 Docs.AfterRender=function(el)
 {
  var m,f;
  m=Runtime.GetOptional(el.Render);
  (m!=null?m.$==1:false)?(f=m.$0,f(el.El),Runtime.SetOptional(el,"Render",null)):void 0;
 };
 Docs.DoSyncElement=function(el)
 {
  var parent,ch,x,a,a$1,a$2,a$3,p,m,v;
  function ins(doc,pos)
  {
   var d,t;
   return doc.$==1?doc.$0.El:doc.$==2?(d=doc.$0,d.Dirty?(d.Dirty=false,Docs.InsertDoc(parent,d.Current,pos)):ins(d.Current,pos)):doc.$==3?pos:doc.$==4?doc.$0.Text:doc.$==5?doc.$0:doc.$==6?(t=doc.$0,(t.Dirty?t.Dirty=false:void 0,Arrays.foldBack(function($1,$2)
   {
    return $1.constructor===Global.Object?ins($1,$2):$1;
   },t.Els,pos))):ins(doc.$0,ins(doc.$1,pos));
  }
  parent=el.El;
  ch=DomNodes.DocChildren(el);
  x=(a=(a$1=el.El,(a$2=Runtime.GetOptional(el.Delimiters),DomNodes.Children(a$1,a$2))),DomNodes.Except(ch,a));
  a$3=(p=el.El,function(e)
  {
   DomUtility.RemoveNode(p,e);
  });
  DomNodes.Iter(a$3,x);
  v=ins(el.Children,(m=Runtime.GetOptional(el.Delimiters),(m!=null?m.$==1:false)?m.$0[1]:null));
 };
 Var.Create$1=function(v)
 {
  var _var;
  _var=null;
  _var=Var.New(false,v,Snap.CreateWithValue(v),Fresh.Int(),function()
  {
   return _var.s;
  });
  return _var;
 };
 Var.Set=function(_var,value)
 {
  if(_var.o)
   (function($1)
   {
    return $1("WebSharper UI.Next: invalid attempt to change value of a Var after calling SetFinal");
   }(function(s)
   {
    Global.console.log(s);
   }));
  else
   {
    Snap.MarkObsolete(_var.s);
    _var.c=value;
    _var.s=Snap.CreateWithValue(value);
   }
 };
 Var=Next.Var=Runtime.Class({
  RView:function()
  {
   return this.v;
  },
  RVal:function()
  {
   return this.c;
  },
  set_RVal:function(v)
  {
   Var.Set(this,v);
  },
  RUpdM:function(f)
  {
   var m,v;
   m=f(this.c);
   (m!=null?m.$==1:false)?(v=m.$0,Var.Set(this,v)):void 0;
  }
 },null,Var);
 Var.New=function(Const,Current,Snap$1,Id,VarView)
 {
  return new Var({
   o:Const,
   c:Current,
   s:Snap$1,
   i:Id,
   v:VarView
  });
 };
 Dictionary=Collections.Dictionary=Runtime.Class({
  TryGetValue:function(k,res)
  {
   var $this,h,d,v,c;
   $this=this;
   h=this.hash(k);
   d=this.data[h];
   return d?(v=(c=function(a)
   {
    var a$1,v$1;
    a$1=Operators.KeyValue(a);
    v$1=a$1[1];
    return $this.equals.apply(null,[a$1[0],k])?{
     $:1,
     $0:v$1
    }:null;
   },function(a)
   {
    return Arrays.tryPick(c,a);
   }(d)),(v!=null?v.$==1:false)?(res.set(v.$0),true):false):false;
  },
  ContainsKey:function(k)
  {
   var $this,h,d,p;
   $this=this;
   h=this.hash(k);
   d=this.data[h];
   return d?(p=function(a)
   {
    return $this.equals.apply(null,[(Operators.KeyValue(a))[0],k]);
   },function(a)
   {
    return Arrays.exists(p,a);
   }(d)):false;
  },
  set_Item:function(k,v)
  {
   this.set(k,v);
  },
  get_Item:function(k)
  {
   return this.get(k);
  },
  set:function(k,v)
  {
   var $this,h,d,m,p,v$1;
   $this=this;
   h=this.hash(k);
   d=this.data[h];
   d?(m=(p=function(a)
   {
    return $this.equals.apply(null,[(Operators.KeyValue(a))[0],k]);
   },function(a)
   {
    return Arrays.tryFindIndex(p,a);
   }(d)),m==null?(this.count=this.count+1,v$1=d.push({
    K:k,
    V:v
   })):d[m.$0]={
    K:k,
    V:v
   }):(this.count=this.count+1,this.data[h]=new Global.Array({
    K:k,
    V:v
   }));
  },
  get:function(k)
  {
   var $this,h,d,c;
   $this=this;
   h=this.hash(k);
   d=this.data[h];
   return d?(c=function(a)
   {
    var a$1,v;
    a$1=Operators.KeyValue(a);
    v=a$1[1];
    return $this.equals.apply(null,[a$1[0],k])?{
     $:1,
     $0:v
    }:null;
   },function(a)
   {
    return Arrays.pick(c,a);
   }(d)):DictionaryUtil.notPresent();
  },
  GetEnumerator:function()
  {
   return Enumerator.Get0(this);
  },
  GetEnumerator0:function()
  {
   var s;
   s=JSModule.GetFieldValues(this.data);
   return Enumerator.Get0(Arrays.concat(s));
  }
 },null,Dictionary);
 Dictionary.New$5=Runtime.Ctor(function()
 {
  Dictionary.New$6.call(this,[],Unchecked.Equals,Unchecked.Hash);
 },Dictionary);
 Dictionary.New$6=Runtime.Ctor(function(init,equals,hash)
 {
  var e,x;
  this.equals=equals;
  this.hash=hash;
  this.count=0;
  this.data=[];
  e=Enumerator.Get(init);
  try
  {
   while(e.MoveNext())
    {
     x=e.Current();
     this.set(x.K,x.V);
    }
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
 },Dictionary);
 JSModule.GetFieldValues=function(o)
 {
  var r,k;
  r=[];
  for(var k$1 in o)r.push(o[k$1]);
  return r;
 };
 Mailbox.StartProcessor=function(procAsync)
 {
  var st;
  function work()
  {
   return Concurrency.Delay(function()
   {
    return Concurrency.Bind(procAsync,function()
    {
     var m,x;
     m=st[0];
     return Unchecked.Equals(m,1)?(st[0]=0,Concurrency.Return(null)):Unchecked.Equals(m,2)?(st[0]=1,x=work(),Concurrency.Bind(x,function()
     {
      return Concurrency.Return(null);
     })):Concurrency.Return(null);
    });
   });
  }
  st=[0];
  return function()
  {
   var m,computation;
   m=st[0];
   Unchecked.Equals(m,0)?(st[0]=1,computation=work(),Concurrency.Start(computation,null)):Unchecked.Equals(m,1)?st[0]=2:void 0;
  };
 };
 Dyn.New=function(DynElem,DynFlags,DynNodes,OnAfterRender)
 {
  var $1;
  $1={
   DynElem:DynElem,
   DynFlags:DynFlags,
   DynNodes:DynNodes
  };
  Runtime.SetOptional($1,"OnAfterRender",OnAfterRender);
  return $1;
 };
 Int32.TryParse=function(s,r)
 {
  return N.TryParse(s,-2147483648,2147483647,r);
 };
 Enumerator.Get=function(x)
 {
  return x instanceof Global.Array?Enumerator.ArrayEnumerator(x):Unchecked.Equals(typeof x,"string")?Enumerator.StringEnumerator(x):x.GetEnumerator();
 };
 Enumerator.ArrayEnumerator=function(s)
 {
  return new T$1.New(0,null,function(e)
  {
   var i;
   i=e.s;
   return i<Arrays.length(s)?(e.c=Arrays.get(s,i),e.s=i+1,true):false;
  },void 0);
 };
 Enumerator.StringEnumerator=function(s)
 {
  return new T$1.New(0,null,function(e)
  {
   var i;
   i=e.s;
   return i<s.length?(e.c=s.charCodeAt(i),e.s=i+1,true):false;
  },void 0);
 };
 Enumerator.Get0=function(x)
 {
  return x instanceof Global.Array?Enumerator.ArrayEnumerator(x):Unchecked.Equals(typeof x,"string")?Enumerator.StringEnumerator(x):"GetEnumerator0"in x?x.GetEnumerator0():x.GetEnumerator();
 };
 SC$2.$cctor=Runtime.Cctor(function()
 {
  SC$2.EmptyAttr=null;
  SC$2.$cctor=Global.ignore;
 });
 Snap.CreateForever=function(v)
 {
  return Snap.Make({
   $:0,
   $0:v
  });
 };
 Snap.Map2Unit=function(sn1,sn2)
 {
  var $1,$2,res,obs;
  function cont()
  {
   var $3,$4,f1,f2;
   if(!Snap.IsDone(res))
    {
     $3=Snap.ValueAndForever(sn1);
     $4=Snap.ValueAndForever(sn2);
     ($3!=null?$3.$==1:false)?($4!=null?$4.$==1:false)?(f1=$3.$0[1],f2=$4.$0[1],(f1?f2:false)?Snap.MarkForever(res,null):Snap.MarkReady(res,null)):void 0:void 0;
    }
  }
  $1=sn1.s;
  $2=sn2.s;
  return $1.$==0?$2.$==0?Snap.CreateForever():sn2:$2.$==0?sn1:(res=Snap.Create(),(obs=Snap.Obs(res),(Snap.When(sn1,cont,obs),Snap.When(sn2,cont,obs),res)));
 };
 Snap.CreateWithValue=function(v)
 {
  return Snap.Make({
   $:2,
   $0:v,
   $1:[]
  });
 };
 Snap.When=function(snap,avail,obsolete)
 {
  var m,v,q2;
  m=snap.s;
  m.$==1?obsolete():m.$==2?(v=m.$0,m.$1.push(obsolete),avail(v)):m.$==3?(q2=m.$1,m.$0.push(avail),q2.push(obsolete)):avail(m.$0);
 };
 Snap.Make=function(st)
 {
  return{
   s:st
  };
 };
 Snap.IsForever=function(snap)
 {
  return snap.s.$==0?true:false;
 };
 Snap.WhenObsolete=function(snap,obsolete)
 {
  var m;
  m=snap.s;
  m.$==1?obsolete():m.$==2?m.$1.push(obsolete):m.$==3?m.$1.push(obsolete):void 0;
 };
 Snap.Create=function()
 {
  return Snap.Make({
   $:3,
   $0:[],
   $1:[]
  });
 };
 Snap.Obs=function(sn)
 {
  return function()
  {
   Snap.MarkObsolete(sn);
  };
 };
 Snap.IsDone=function(snap)
 {
  var m;
  m=snap.s;
  return m.$==0?true:m.$==2?true:false;
 };
 Snap.ValueAndForever=function(snap)
 {
  var m;
  m=snap.s;
  return m.$==0?{
   $:1,
   $0:[m.$0,true]
  }:m.$==2?{
   $:1,
   $0:[m.$0,false]
  }:null;
 };
 Snap.MarkForever=function(sn,v)
 {
  var m,q;
  m=sn.s;
  m.$==3?(q=m.$0,sn.s={
   $:0,
   $0:v
  },Seq.iter(function(k)
  {
   k(v);
  },q)):void 0;
 };
 Snap.MarkReady=function(sn,v)
 {
  var m,q2,q1;
  m=sn.s;
  m.$==3?(q2=m.$1,q1=m.$0,sn.s={
   $:2,
   $0:v,
   $1:q2
  },Seq.iter(function(k)
  {
   k(v);
  },q1)):void 0;
 };
 Snap.Join=function(snap)
 {
  var res,obs;
  res=Snap.Create();
  obs=Snap.Obs(res);
  Snap.When(snap,function(x)
  {
   var y;
   y=x();
   Snap.When(y,function(v)
   {
    if(Snap.IsForever(y)?Snap.IsForever(snap):false)
     Snap.MarkForever(res,v);
    else
     Snap.MarkReady(res,v);
   },obs);
  },obs);
  return res;
 };
 Snap.Map=function(fn,sn)
 {
  var m,x,res,g;
  m=sn.s;
  return m.$==0?(x=m.$0,Snap.CreateForever(fn(x))):(res=Snap.Create(),(Snap.When(sn,(g=function(v)
  {
   Snap.MarkDone(res,sn,v);
  },function(x$1)
  {
   return g(fn(x$1));
  }),Snap.Obs(res)),res));
 };
 Snap.Map3=function(fn,sn1,sn2,sn3)
 {
  var $1,$2,$3,x,y,z,x$1,y$1,x$2,z$1,x$3,y$2,z$2,y$3,z$3,res,obs;
  function cont(a)
  {
   var $4,$5,$6,f1,f2,f3,x$4,y$4,z$4;
   if(!Snap.IsDone(res))
    {
     $4=Snap.ValueAndForever(sn1);
     $5=Snap.ValueAndForever(sn2);
     $6=Snap.ValueAndForever(sn3);
     ($4!=null?$4.$==1:false)?($5!=null?$5.$==1:false)?($6!=null?$6.$==1:false)?(f1=$4.$0[1],f2=$5.$0[1],f3=$6.$0[1],x$4=$4.$0[0],y$4=$5.$0[0],z$4=$6.$0[0],((f1?f2:false)?f3:false)?Snap.MarkForever(res,fn(x$4,y$4,z$4)):Snap.MarkReady(res,fn(x$4,y$4,z$4))):void 0:void 0:void 0;
    }
  }
  $1=sn1.s;
  $2=sn2.s;
  $3=sn3.s;
  return $1.$==0?$2.$==0?$3.$==0?(x=$1.$0,(y=$2.$0,(z=$3.$0,Snap.CreateForever(fn(x,y,z))))):(x$1=$1.$0,(y$1=$2.$0,Snap.Map(function(z$4)
  {
   return fn(x$1,y$1,z$4);
  },sn3))):$3.$==0?(x$2=$1.$0,(z$1=$3.$0,Snap.Map(function(y$4)
  {
   return fn(x$2,y$4,z$1);
  },sn2))):(x$3=$1.$0,Snap.Map2(function($4,$5)
  {
   return fn(x$3,$4,$5);
  },sn2,sn3)):$2.$==0?$3.$==0?(y$2=$2.$0,(z$2=$3.$0,Snap.Map(function(x$4)
  {
   return fn(x$4,y$2,z$2);
  },sn1))):(y$3=$2.$0,Snap.Map2(function($4,$5)
  {
   return fn($4,y$3,$5);
  },sn1,sn3)):$3.$==0?(z$3=$3.$0,Snap.Map2(function($4,$5)
  {
   return fn($4,$5,z$3);
  },sn1,sn2)):(res=Snap.Create(),(obs=Snap.Obs(res),(Snap.When(sn1,cont,obs),Snap.When(sn2,cont,obs),Snap.When(sn3,cont,obs),res)));
 };
 Snap.Sequence=function(snaps)
 {
  var snaps$1,res,w,obs,cont,a;
  snaps$1=Arrays.ofSeq(snaps);
  return snaps$1.length==0?Snap.CreateForever([]):(res=Snap.Create(),(w=[Arrays.length(snaps$1)-1],(obs=Snap.Obs(res),(cont=function()
  {
   var vs,m;
   if(w[0]===0)
    {
     vs=(m=function(s)
     {
      var m$1;
      m$1=s.s;
      return m$1.$==0?m$1.$0:m$1.$==2?m$1.$0:Operators.FailWith("value not found by View.Sequence");
     },function(a$1)
     {
      return Arrays.map(m,a$1);
     }(snaps$1));
     Arrays.forall(Snap.IsForever,snaps$1)?Snap.MarkForever(res,vs):Snap.MarkReady(res,vs);
    }
   else
    Ref.decr(w);
  },(a=function(s)
  {
   Snap.When(s,cont,obs);
  },function(a$1)
  {
   Arrays.iter(a,a$1);
  }(snaps$1),res)))));
 };
 Snap.Map2=function(fn,sn1,sn2)
 {
  var $1,$2,x,y,x$1,y$1,res,obs;
  function cont(a)
  {
   var $3,$4,f1,f2,x$2,y$2;
   if(!Snap.IsDone(res))
    {
     $3=Snap.ValueAndForever(sn1);
     $4=Snap.ValueAndForever(sn2);
     ($3!=null?$3.$==1:false)?($4!=null?$4.$==1:false)?(f1=$3.$0[1],f2=$4.$0[1],x$2=$3.$0[0],y$2=$4.$0[0],(f1?f2:false)?Snap.MarkForever(res,fn(x$2,y$2)):Snap.MarkReady(res,fn(x$2,y$2))):void 0:void 0;
    }
  }
  $1=sn1.s;
  $2=sn2.s;
  return $1.$==0?$2.$==0?(x=$1.$0,(y=$2.$0,Snap.CreateForever(fn(x,y)))):(x$1=$1.$0,Snap.Map(function(y$2)
  {
   return fn(x$1,y$2);
  },sn2)):$2.$==0?(y$1=$2.$0,Snap.Map(function(x$2)
  {
   return fn(x$2,y$1);
  },sn1)):(res=Snap.Create(),(obs=Snap.Obs(res),(Snap.When(sn1,cont,obs),Snap.When(sn2,cont,obs),res)));
 };
 Snap.MarkObsolete=function(sn)
 {
  var m,$1;
  m=sn.s;
  (m.$==1?true:m.$==2?($1=m.$1,false):m.$==3?($1=m.$1,false):true)?void 0:(sn.s={
   $:1
  },Seq.iter(function(k)
  {
   k();
  },$1));
 };
 Snap.MarkDone=function(res,sn,v)
 {
  if(Snap.IsForever(sn))
   Snap.MarkForever(res,v);
  else
   Snap.MarkReady(res,v);
 };
 Fresh.Int=function()
 {
  Fresh.set_counter(Fresh.counter()+1);
  return Fresh.counter();
 };
 Fresh.set_counter=function($1)
 {
  SC$4.$cctor();
  SC$4.counter=$1;
 };
 Fresh.counter=function()
 {
  SC$4.$cctor();
  return SC$4.counter;
 };
 SC$3.$cctor=Runtime.Cctor(function()
 {
  SC$3.LoadedTemplates=new Dictionary.New$5();
  SC$3.TextHoleRE="\\${([^}]+)}";
  SC$3.$cctor=Global.ignore;
 });
 CheckedInput=Next.CheckedInput=Runtime.Class({
  get_Input:function()
  {
   return this.$==1?this.$0:this.$==2?this.$0:this.$1;
  }
 },null,CheckedInput);
 AttrModule.Handler=function(name,callback)
 {
  return Attrs.Static(function(el)
  {
   el.addEventListener(name,function(d)
   {
    return(callback(el))(d);
   },false);
  });
 };
 AttrModule.OnAfterRender=function(callback)
 {
  return new AttrProxy({
   $:4,
   $0:callback
  });
 };
 AttrModule.Value=function(_var)
 {
  var f,g;
  return AttrModule.CustomValue(_var,Global.id,(f=Global.id,(g=function(a)
  {
   return{
    $:1,
    $0:a
   };
  },function(x)
  {
   return g(f(x));
  })));
 };
 AttrModule.Checked=function(_var)
 {
  var onSet;
  onSet=function(el)
  {
   return!Unchecked.Equals(_var.RVal(),el.checked)?_var.set_RVal(el.checked):null;
  };
  return AttrProxy.Concat([AttrModule.DynamicProp("checked",_var.RView()),AttrModule.Handler("change",function($1)
  {
   return function($2)
   {
    return onSet($1,$2);
   };
  }),AttrModule.Handler("click",function($1)
  {
   return function($2)
   {
    return onSet($1,$2);
   };
  })]);
 };
 AttrModule.IntValue=function(_var)
 {
  return AttrModule.CustomVar(_var,function($1,$2)
  {
   var i;
   i=$2.get_Input();
   return $1.value!==i?void($1.value=i):null;
  },function(el)
  {
   var s,m,o,i;
   s=el.value;
   return{
    $:1,
    $0:String.isBlank(s)?(el.checkValidity?el.checkValidity():true)?new CheckedInput({
     $:2,
     $0:s
    }):new CheckedInput({
     $:1,
     $0:s
    }):(m=(o=0,[Int32.TryParse(s,{
     get:function()
     {
      return o;
     },
     set:function(v)
     {
      o=v;
     }
    }),o]),m[0]?(i=m[1],new CheckedInput({
     $:0,
     $0:i,
     $1:s
    })):new CheckedInput({
     $:1,
     $0:s
    }))
   };
  });
 };
 AttrModule.IntValueUnchecked=function(_var)
 {
  return AttrModule.CustomValue(_var,Global.String,function(s)
  {
   var pd;
   return String.isBlank(s)?{
    $:1,
    $0:0
   }:(pd=+s,pd!==pd>>0?null:{
    $:1,
    $0:pd
   });
  });
 };
 AttrModule.FloatValue=function(_var)
 {
  return AttrModule.CustomVar(_var,function($1,$2)
  {
   var i;
   i=$2.get_Input();
   return $1.value!==i?void($1.value=i):null;
  },function(el)
  {
   var s,i;
   s=el.value;
   return{
    $:1,
    $0:String.isBlank(s)?(el.checkValidity?el.checkValidity():true)?new CheckedInput({
     $:2,
     $0:s
    }):new CheckedInput({
     $:1,
     $0:s
    }):(i=+s,Global.isNaN(i)?new CheckedInput({
     $:1,
     $0:s
    }):new CheckedInput({
     $:0,
     $0:i,
     $1:s
    }))
   };
  });
 };
 AttrModule.FloatValueUnchecked=function(_var)
 {
  return AttrModule.CustomValue(_var,Global.String,function(s)
  {
   var pd;
   return String.isBlank(s)?{
    $:1,
    $0:0
   }:(pd=+s,Global.isNaN(pd)?null:{
    $:1,
    $0:pd
   });
  });
 };
 AttrModule.Dynamic=function(name,view)
 {
  return Attrs.Dynamic(view,function(el)
  {
   return function(v)
   {
    return DomUtility.SetAttr(el,name,v);
   };
  });
 };
 AttrModule.CustomValue=function(_var,toString,fromString)
 {
  return AttrModule.CustomVar(_var,function($1,$2)
  {
   $1.value=toString($2);
  },function(e)
  {
   return fromString(e.value);
  });
 };
 AttrModule.DynamicProp=function(name,view)
 {
  return Attrs.Dynamic(view,function(el)
  {
   return function(v)
   {
    el[name]=v;
   };
  });
 };
 AttrModule.CustomVar=function(_var,set,get)
 {
  var onChange,set$1;
  onChange=function(el)
  {
   return _var.RUpdM(function(v)
   {
    var m,$1,x;
    m=get(el);
    return((m!=null?m.$==1:false)?(x=m.$0,!Unchecked.Equals(x,v))?($1=[m,m.$0],true):false:false)?$1[0]:null;
   });
  };
  set$1=function(e,v)
  {
   var m,$1,x;
   m=get(e);
   return((m!=null?m.$==1:false)?(x=m.$0,Unchecked.Equals(x,v))?($1=m.$0,true):false:false)?null:set(e,v);
  };
  return AttrProxy.Concat([AttrModule.Handler("change",function($1)
  {
   return function($2)
   {
    return onChange($1,$2);
   };
  }),AttrModule.Handler("input",function($1)
  {
   return function($2)
   {
    return onChange($1,$2);
   };
  }),AttrModule.Handler("keypress",function($1)
  {
   return function($2)
   {
    return onChange($1,$2);
   };
  }),AttrModule.DynamicCustom(function($1)
  {
   return function($2)
   {
    return set$1($1,$2);
   };
  },_var.RView())]);
 };
 AttrModule.DynamicCustom=function(set,view)
 {
  return Attrs.Dynamic(view,set);
 };
 Slice.string=function(source,start,finish)
 {
  return start==null?(finish!=null?finish.$==1:false)?source.slice(0,finish.$0+1):"":finish==null?source.slice(start.$0):source.slice(start.$0,finish.$0+1);
 };
 Strings.concat=function(separator,strings)
 {
  return Arrays.ofSeq(strings).join(separator);
 };
 Strings.SplitChars=function(s,sep,opts)
 {
  var re;
  re="["+Strings.RegexEscape(Global.String.fromCharCode.apply(void 0,sep))+"]";
  return Strings.Split(s,new Global.RegExp(re),opts);
 };
 Strings.StartsWith=function(t,s)
 {
  return t.substring(0,s.length)==s;
 };
 Strings.Replace=function(subject,search,replace)
 {
  function replaceLoop(subj)
  {
   var index,replaced,nextStartIndex,ct;
   index=subj.indexOf(search);
   return index!==-1?(replaced=Strings.ReplaceOnce(subj,search,replace),(nextStartIndex=index+replace.length,(ct=index+replace.length,Strings.Substring(replaced,0,ct))+replaceLoop(replaced.substring(nextStartIndex)))):subj;
  }
  return replaceLoop(subject);
 };
 Strings.RegexEscape=function(s)
 {
  return s.replace(new Global.RegExp("[-\\/\\\\^$*+?.()|[\\]{}]","g"),"\\$&");
 };
 Strings.Split=function(s,pat,opts)
 {
  var res;
  res=Strings.SplitWith(s,pat);
  return opts===1?Arrays.filter(function(x)
  {
   return x!=="";
  },res):res;
 };
 Strings.forall=function(f,s)
 {
  return Seq.forall(f,Strings.protect(s));
 };
 Strings.ReplaceOnce=function(string,search,replace)
 {
  return string.replace(search,replace);
 };
 Strings.SplitWith=function(str,pat)
 {
  return str.split(pat);
 };
 Strings.protect=function(s)
 {
  return s===null?"":s;
 };
 Strings.Substring=function(s,ix,ct)
 {
  return s.substr(ix,ct);
 };
 RunState.New=function(PreviousNodes,Top)
 {
  return{
   PreviousNodes:PreviousNodes,
   Top:Top
  };
 };
 NodeSet.get_Empty=function()
 {
  return{
   $:0,
   $0:new HashSet.New$3()
  };
 };
 NodeSet.FindAll=function(doc)
 {
  var q;
  function loop(node)
  {
   var b,t,a;
   if(node.$==0)
    {
     b=node.$1;
     loop(node.$0);
     loop(b);
    }
   else
    if(node.$==1)
     loopEN(node.$0);
    else
     if(node.$==2)
      loop(node.$0.Current);
     else
      if(node.$==6)
       {
        t=node.$0;
        a=t.Holes;
        Arrays.iter(loopEN,a);
       }
  }
  function loopEN(el)
  {
   q.push(el);
   loop(el.Children);
  }
  q=[];
  loop(doc);
  return{
   $:0,
   $0:new HashSet.New$2(q)
  };
 };
 NodeSet.Filter=function(f,a)
 {
  var set;
  set=a.$0;
  return{
   $:0,
   $0:HashSet$1.Filter(f,set)
  };
 };
 NodeSet.Intersect=function(a,a$1)
 {
  var a$2,b;
  a$2=a.$0;
  b=a$1.$0;
  return{
   $:0,
   $0:HashSet$1.Intersect(a$2,b)
  };
 };
 NodeSet.ToArray=function(a)
 {
  return HashSet$1.ToArray(a.$0);
 };
 NodeSet.Except=function(a,a$1)
 {
  var excluded,included;
  excluded=a.$0;
  included=a$1.$0;
  return{
   $:0,
   $0:HashSet$1.Except(excluded,included)
  };
 };
 An.get_UseAnimations=function()
 {
  return Anims.UseAnimations();
 };
 An.Play=function(anim)
 {
  return Concurrency.Delay(function()
  {
   var x,a;
   x=(a=function()
   {
   },function(a$1)
   {
    return An.Run(a,a$1);
   }(Anims.Actions(anim)));
   return Concurrency.Bind(x,function()
   {
    Anims.Finalize(anim);
    return Concurrency.Return(null);
   });
  });
 };
 An.Append=function(a,a$1)
 {
  var a$2,b;
  a$2=a.$0;
  b=a$1.$0;
  return{
   $:0,
   $0:AppendList.Append(a$2,b)
  };
 };
 An.Concat=function(xs)
 {
  return{
   $:0,
   $0:AppendList.Concat(Seq.map(Anims.List,xs))
  };
 };
 An.Run=function(k,anim)
 {
  var dur,a;
  dur=anim.Duration;
  a=function(ok)
  {
   var v;
   function loop(start,now)
   {
    var t,v$1;
    t=now-start;
    anim.Compute(t);
    k();
    return t<=dur?(v$1=Global.requestAnimationFrame(function(t$1)
    {
     loop(start,t$1);
    }),void 0):ok();
   }
   v=Global.requestAnimationFrame(function(t)
   {
    loop(t,t);
   });
  };
  return Concurrency.FromContinuations(function($1,$2,$3)
  {
   return a.apply(null,[$1,$2,$3]);
  });
 };
 An.get_Empty=function()
 {
  return{
   $:0,
   $0:AppendList.Empty()
  };
 };
 Async.Schedule=function(f)
 {
  Concurrency.Start(Concurrency.Delay(function()
  {
   f();
   return Concurrency.Return(null);
  }),null);
 };
 T$1=Enumerator.T=Runtime.Class({
  MoveNext:function()
  {
   return this.n(this);
  },
  Current:function()
  {
   return this.c;
  },
  Dispose:function()
  {
   if(this.d)
    this.d(this);
  }
 },null,T$1);
 T$1.New=Runtime.Ctor(function(s,c,n,d)
 {
  this.s=s;
  this.c=c;
  this.n=n;
  this.d=d;
 },T$1);
 Seq.iter=function(p,s)
 {
  var e;
  e=Enumerator.Get(s);
  try
  {
   while(e.MoveNext())
    p(e.Current());
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
 };
 Seq.fold=function(f,x,s)
 {
  var r,e;
  r=x;
  e=Enumerator.Get(s);
  try
  {
   while(e.MoveNext())
    r=f(r,e.Current());
   return r;
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
 };
 Seq.map=function(f,s)
 {
  return{
   GetEnumerator:function()
   {
    var en;
    en=Enumerator.Get(s);
    return new T$1.New(null,null,function(e)
    {
     return en.MoveNext()?(e.c=f(en.Current()),true):false;
    },function()
    {
     en.Dispose();
    });
   }
  };
 };
 Seq.forall=function(p,s)
 {
  return!Seq.exists(function(x)
  {
   return!p(x);
  },s);
 };
 Seq.max=function(s)
 {
  return Seq.reduce(function($1,$2)
  {
   return Unchecked.Compare($1,$2)>=0?$1:$2;
  },s);
 };
 Seq.exists=function(p,s)
 {
  var e,r;
  e=Enumerator.Get(s);
  try
  {
   r=false;
   while(!r?e.MoveNext():false)
    r=p(e.Current());
   return r;
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
 };
 Seq.reduce=function(f,source)
 {
  var e,r;
  e=Enumerator.Get(source);
  try
  {
   if(!e.MoveNext())
    Operators.FailWith("The input sequence was empty");
   r=e.Current();
   while(e.MoveNext())
    r=f(r,e.Current());
   return r;
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
 };
 HashSet=Collections.HashSet=Runtime.Class({
  Contains:function(item)
  {
   var arr;
   arr=this.data[this.hash(item)];
   return arr==null?false:this.arrContains(item,arr);
  },
  Add:function(item)
  {
   return this.add(item);
  },
  arrContains:function(item,arr)
  {
   var c,i,$1,l;
   c=true;
   i=0;
   l=arr.length;
   while(c?i<l:false)
    if(this.equals.apply(null,[arr[i],item]))
     c=false;
    else
     i=i+1;
   return!c;
  },
  add:function(item)
  {
   var h,arr,v;
   h=this.hash(item);
   arr=this.data[h];
   return arr==null?(this.data[h]=[item],this.count=this.count+1,true):this.arrContains(item,arr)?false:(v=arr.push(item),this.count=this.count+1,true);
  },
  IntersectWith:function(xs)
  {
   var other,all,i,$1,item,v;
   other=new HashSet.New$4(xs,this.equals,this.hash);
   all=HashSetUtil.concat(this.data);
   for(i=0,$1=all.length-1;i<=$1;i++){
    item=all[i];
    !other.Contains(item)?v=this.Remove(item):void 0;
   }
  },
  get_Count:function()
  {
   return this.count;
  },
  CopyTo:function(arr)
  {
   var i,all,i$1,$1;
   i=0;
   all=HashSetUtil.concat(this.data);
   for(i$1=0,$1=all.length-1;i$1<=$1;i$1++)Arrays.set(arr,i$1,all[i$1]);
  },
  ExceptWith:function(xs)
  {
   var e,v;
   e=Enumerator.Get(xs);
   try
   {
    while(e.MoveNext())
     {
      v=this.Remove(e.Current());
     }
   }
   finally
   {
    if("Dispose"in e)
     e.Dispose();
   }
  },
  Remove:function(item)
  {
   var arr;
   arr=this.data[this.hash(item)];
   return arr==null?false:this.arrRemove(item,arr)?(this.count=this.count-1,true):false;
  },
  arrRemove:function(item,arr)
  {
   var c,i,$1,l,v;
   c=true;
   i=0;
   l=arr.length;
   while(c?i<l:false)
    if(this.equals.apply(null,[arr[i],item]))
     {
      v=arr.splice.apply(arr,[i,1].concat([]));
      c=false;
     }
    else
     i=i+1;
   return!c;
  },
  GetEnumerator:function()
  {
   return Enumerator.Get(HashSetUtil.concat(this.data));
  },
  GetEnumerator0:function()
  {
   return Enumerator.Get(HashSetUtil.concat(this.data));
  }
 },null,HashSet);
 HashSet.New$3=Runtime.Ctor(function()
 {
  HashSet.New$4.call(this,[],Unchecked.Equals,Unchecked.Hash);
 },HashSet);
 HashSet.New$2=Runtime.Ctor(function(init)
 {
  HashSet.New$4.call(this,init,Unchecked.Equals,Unchecked.Hash);
 },HashSet);
 HashSet.New$4=Runtime.Ctor(function(init,equals,hash)
 {
  var e,v;
  this.equals=equals;
  this.hash=hash;
  this.data=Global.Array.prototype.constructor.apply(Global.Array,[]);
  this.count=0;
  e=Enumerator.Get(init);
  try
  {
   while(e.MoveNext())
    {
     v=this.add(e.Current());
    }
  }
  finally
  {
   if("Dispose"in e)
    e.Dispose();
  }
 },HashSet);
 DictionaryUtil.notPresent=function()
 {
  return Operators.FailWith("The given key was not present in the dictionary.");
 };
 String.isBlank=function(s)
 {
  return Strings.forall(Char.IsWhiteSpace,s);
 };
 Concurrency.Delay=function(mk)
 {
  return function(c)
  {
   try
   {
    (mk(null))(c);
   }
   catch(e)
   {
    c.k({
     $:1,
     $0:e
    });
   }
  };
 };
 Concurrency.Bind=function(r,f)
 {
  return Concurrency.checkCancel(function(c)
  {
   r({
    k:function(a)
    {
     var x;
     if(a.$==0)
      {
       x=a.$0;
       Concurrency.scheduler().Fork(function()
       {
        try
        {
         (f(x))(c);
        }
        catch(e)
        {
         c.k({
          $:1,
          $0:e
         });
        }
       });
      }
     else
      Concurrency.scheduler().Fork(function()
      {
       c.k(a);
      });
    },
    ct:c.ct
   });
  });
 };
 Concurrency.Return=function(x)
 {
  return function(c)
  {
   c.k({
    $:0,
    $0:x
   });
  };
 };
 Concurrency.Start=function(c,ctOpt)
 {
  var ct;
  ct=Operators.DefaultArg(ctOpt,(Concurrency.defCTS())[0]);
  Concurrency.scheduler().Fork(function()
  {
   if(!ct.c)
    c({
     k:function(a)
     {
      if(a.$==1)
       Concurrency.UncaughtAsyncError(a.$0);
     },
     ct:ct
    });
  });
 };
 Concurrency.FromContinuations=function(subscribe)
 {
  return function(c)
  {
   var continued,once;
   continued=[false];
   once=function(cont)
   {
    if(continued[0])
     Operators.FailWith("A continuation provided by Async.FromContinuations was invoked multiple times");
    else
     {
      continued[0]=true;
      Concurrency.scheduler().Fork(cont);
     }
   };
   subscribe(function(a)
   {
    once(function()
    {
     c.k({
      $:0,
      $0:a
     });
    });
   },function(e)
   {
    once(function()
    {
     c.k({
      $:1,
      $0:e
     });
    });
   },function(e)
   {
    once(function()
    {
     c.k({
      $:2,
      $0:e
     });
    });
   });
  };
 };
 Concurrency.checkCancel=function(r)
 {
  return function(c)
  {
   if(c.ct.c)
    Concurrency.cancel(c);
   else
    r(c);
  };
 };
 Concurrency.defCTS=function()
 {
  SC$6.$cctor();
  return SC$6.defCTS;
 };
 Concurrency.UncaughtAsyncError=function(e)
 {
  Global.console.log.apply(Global.console,["WebSharper: Uncaught asynchronous exception"].concat([e]));
 };
 Concurrency.cancel=function(c)
 {
  c.k({
   $:2,
   $0:new OperationCanceledException.New(c.ct)
  });
 };
 Concurrency.scheduler=function()
 {
  SC$6.$cctor();
  return SC$6.scheduler;
 };
 Anims.UseAnimations=function()
 {
  SC$5.$cctor();
  return SC$5.UseAnimations;
 };
 Anims.Actions=function(a)
 {
  var all,c;
  all=a.$0;
  return Anims.ConcatActions((c=function(a$1)
  {
   return a$1.$==1?{
    $:1,
    $0:a$1.$0
   }:null;
  },function(a$1)
  {
   return Arrays.choose(c,a$1);
  }(AppendList.ToArray(all))));
 };
 Anims.Finalize=function(a)
 {
  var all,a$1;
  all=a.$0;
  a$1=function(a$2)
  {
   if(a$2.$==0)
    a$2.$0();
  };
  (function(a$2)
  {
   Arrays.iter(a$1,a$2);
  }(AppendList.ToArray(all)));
 };
 Anims.List=function(a)
 {
  return a.$0;
 };
 Anims.ConcatActions=function(xs)
 {
  var xs$1,m,dur,m$1,xs$2;
  xs$1=Array.ofSeqNonCopying(xs);
  m=Arrays.length(xs$1);
  return m===0?Anims.Const():m===1?Arrays.get(xs$1,0):(dur=Seq.max((m$1=function(anim)
  {
   return anim.Duration;
  },function(s)
  {
   return Seq.map(m$1,s);
  }(xs$1))),(xs$2=Arrays.map(function(a)
  {
   return Anims.Prolong(dur,a);
  },xs$1),Anims.Def(dur,function(t)
  {
   Arrays.iter(function(anim)
   {
    anim.Compute(t);
   },xs$2);
  })));
 };
 Anims.Const=function(v)
 {
  return Anims.Def(0,function()
  {
   return v;
  });
 };
 Anims.Prolong=function(nextDuration,anim)
 {
  var comp,dur,last;
  comp=anim.Compute;
  dur=anim.Duration;
  last=Lazy.Create(function()
  {
   return anim.Compute(anim.Duration);
  });
  return{
   Compute:function(t)
   {
    return t>=dur?last.f():comp(t);
   },
   Duration:nextDuration
  };
 };
 Anims.Def=function(d,f)
 {
  return{
   Compute:f,
   Duration:d
  };
 };
 AppendList.Append=function(x,y)
 {
  return x.$==0?y:y.$==0?x:{
   $:2,
   $0:x,
   $1:y
  };
 };
 AppendList.Concat=function(xs)
 {
  var x,d;
  x=Array.ofSeqNonCopying(xs);
  d=AppendList.Empty();
  return Array.TreeReduce(d,AppendList.Append,x);
 };
 AppendList.ToArray=function(xs)
 {
  var out;
  function loop(xs$1)
  {
   var y,xs$2;
   if(xs$1.$==1)
    out.push(xs$1.$0);
   else
    if(xs$1.$==2)
     {
      y=xs$1.$1;
      loop(xs$1.$0);
      loop(y);
     }
    else
     if(xs$1.$==3)
      {
       xs$2=xs$1.$0;
       Arrays.iter(function(v)
       {
        out.push(v);
       },xs$2);
      }
  }
  out=[];
  loop(xs);
  return out.slice(0);
 };
 AppendList.Empty=function()
 {
  SC$7.$cctor();
  return SC$7.Empty;
 };
 SC$4.$cctor=Runtime.Cctor(function()
 {
  SC$4.counter=0;
  SC$4.$cctor=Global.ignore;
 });
 Char.IsWhiteSpace=function(c)
 {
  return Global.String.fromCharCode(c).match(new Global.RegExp("\\s"))!==null;
 };
 N.TryParse=function(s,min,max,r)
 {
  var x,ok;
  x=+s;
  ok=(x===x-x%1?x>=min:false)?x<=max:false;
  ok?r.set(x):void 0;
  return ok;
 };
 DynamicAttrNode=Next.DynamicAttrNode=Runtime.Class({
  NChanged:function()
  {
   return this.updates;
  },
  NGetChangeAnim:function(parent)
  {
   return An.get_Empty();
  },
  NGetEnterAnim:function(parent)
  {
   return An.get_Empty();
  },
  NGetExitAnim:function(parent)
  {
   return An.get_Empty();
  },
  NSync:function(parent)
  {
   if(this.dirty)
    {
     (this.push(parent))(this.value);
     this.dirty=false;
    }
  }
 },null,DynamicAttrNode);
 DynamicAttrNode.New=Runtime.Ctor(function(view,push)
 {
  var $this,a;
  $this=this;
  this.push=push;
  this.value=void 0;
  this.dirty=false;
  this.updates=(a=function(x)
  {
   $this.value=x;
   $this.dirty=true;
  },function(a$1)
  {
   return View.Map(a,a$1);
  }(view));
 },DynamicAttrNode);
 SC$5.$cctor=Runtime.Cctor(function()
 {
  SC$5.CubicInOut=Easing.Custom(function(t)
  {
   var t2;
   t2=t*t;
   return 3*t2-2*(t2*t);
  });
  SC$5.UseAnimations=true;
  SC$5.$cctor=Global.ignore;
 });
 HashSet$1.Filter=function(ok,set)
 {
  var a;
  return new HashSet.New$2((a=HashSet$1.ToArray(set),Arrays.filter(ok,a)));
 };
 HashSet$1.Intersect=function(a,b)
 {
  var set;
  set=new HashSet.New$2(HashSet$1.ToArray(a));
  set.IntersectWith(HashSet$1.ToArray(b));
  return set;
 };
 HashSet$1.ToArray=function(set)
 {
  var arr;
  arr=Arrays.create(set.get_Count(),void 0);
  set.CopyTo(arr);
  return arr;
 };
 HashSet$1.Except=function(excluded,included)
 {
  var set;
  set=new HashSet.New$2(HashSet$1.ToArray(included));
  set.ExceptWith(HashSet$1.ToArray(excluded));
  return set;
 };
 Scheduler=Concurrency.Scheduler=Runtime.Class({
  Fork:function(action)
  {
   var $this,v;
   $this=this;
   this.robin.push(action);
   this.idle?(this.idle=false,v=Global.setTimeout(function()
   {
    $this.tick();
   },0)):void 0;
  },
  tick:function()
  {
   var loop,$this,t,m,v;
   $this=this;
   t=Global.Date.now();
   loop=true;
   while(loop)
    {
     m=this.robin.length;
     m===0?(this.idle=true,loop=false):((this.robin.shift())(),Global.Date.now()-t>40?(v=Global.setTimeout(function()
     {
      $this.tick();
     },0),loop=false):void 0);
    }
  }
 },null,Scheduler);
 Scheduler.New=Runtime.Ctor(function()
 {
  this.idle=true;
  this.robin=[];
 },Scheduler);
 SC$6.$cctor=Runtime.Cctor(function()
 {
  SC$6.noneCT={
   c:false,
   r:[]
  };
  SC$6.scheduler=new Scheduler.New();
  SC$6.defCTS=[new CancellationTokenSource.New()];
  SC$6.GetCT=function(c)
  {
   c.k({
    $:0,
    $0:c.ct
   });
  };
  SC$6.$cctor=Global.ignore;
 });
 Easing=Next.Easing=Runtime.Class({},null,Easing);
 Easing.Custom=function(f)
 {
  return new Easing.New(f);
 };
 Easing.New=Runtime.Ctor(function(transformTime)
 {
  this.transformTime=transformTime;
 },Easing);
 DomNodes.DocChildren=function(node)
 {
  var q;
  function loop(doc)
  {
   var t,a,b;
   if(doc.$==2)
    loop(doc.$0.Current);
   else
    if(doc.$==1)
     q.push(doc.$0.El);
    else
     if(doc.$==3)
      ;
     else
      if(doc.$==5)
       q.push(doc.$0);
      else
       if(doc.$==4)
        q.push(doc.$0.Text);
       else
        if(doc.$==6)
         {
          t=doc.$0;
          a=function(a$1)
          {
           if(a$1.constructor===Global.Object)
            loop(a$1);
           else
            q.push(a$1);
          };
          (function(a$1)
          {
           Arrays.iter(a,a$1);
          }(t.Els));
         }
        else
         {
          b=doc.$1;
          loop(doc.$0);
          loop(b);
         }
  }
  q=[];
  loop(node.Children);
  return{
   $:0,
   $0:Array.ofSeqNonCopying(q)
  };
 };
 DomNodes.Children=function(elem,delims)
 {
  var n,o,rdelim,ldelim,a,v;
  if(delims!=null?delims.$==1:false)
   {
    rdelim=delims.$0[1];
    ldelim=delims.$0[0];
    a=Global.Array.prototype.constructor.apply(Global.Array,[]);
    n=ldelim.nextSibling;
    while(n!==rdelim)
     {
      v=a.push(n);
      n=n.nextSibling;
     }
    return{
     $:0,
     $0:a
    };
   }
  else
   return{
    $:0,
    $0:Arrays.init(elem.childNodes.length,(o=elem.childNodes,function(a$1)
    {
     return o[a$1];
    }))
   };
 };
 DomNodes.Except=function(a,a$1)
 {
  var excluded,included,p;
  excluded=a.$0;
  included=a$1.$0;
  return{
   $:0,
   $0:(p=function(n)
   {
    var p$1;
    p$1=function(k)
    {
     return!(n===k);
    };
    return function(a$2)
    {
     return Arrays.forall(p$1,a$2);
    }(excluded);
   },function(a$2)
   {
    return Arrays.filter(p,a$2);
   }(included))
  };
 };
 DomNodes.Iter=function(f,a)
 {
  var ns;
  ns=a.$0;
  Arrays.iter(f,ns);
 };
 OperationCanceledException=WebSharper.OperationCanceledException=Runtime.Class({},null,OperationCanceledException);
 OperationCanceledException.New=Runtime.Ctor(function(ct)
 {
  OperationCanceledException.New$1.call(this,"The operation was canceled.",null,ct);
 },OperationCanceledException);
 OperationCanceledException.New$1=Runtime.Ctor(function(message,inner,ct)
 {
  this.message=message;
  this.inner=inner;
  this.ct=ct;
 },OperationCanceledException);
 CancellationTokenSource=WebSharper.CancellationTokenSource=Runtime.Class({},null,CancellationTokenSource);
 CancellationTokenSource.New=Runtime.Ctor(function()
 {
  this.c=false;
  this.pending=null;
  this.r=[];
  this.init=1;
 },CancellationTokenSource);
 HashSetUtil.concat=function(o)
 {
  var r,k;
  r=[];
  for(var k$1 in o)r.push.apply(r,o[k$1]);
  return r;
 };
 SC$7.$cctor=Runtime.Cctor(function()
 {
  SC$7.Empty={
   $:0
  };
  SC$7.$cctor=Global.ignore;
 });
 Lazy.Create=function(f)
 {
  return{
   c:false,
   v:f,
   f:Lazy.forceLazy
  };
 };
 Lazy.forceLazy=function()
 {
  var v;
  v=this.v();
  this.c=true;
  this.v=v;
  this.f=Lazy.cachedLazy;
  return v;
 };
 Lazy.cachedLazy=function()
 {
  return this.v;
 };
 Client.Main();
}());


if (typeof IntelliFactory !=='undefined')
  IntelliFactory.Runtime.Start();
