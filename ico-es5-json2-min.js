/* Ico Graph Prototype/Raphael library
 *
 * Copyright (c) 2009-2012 Jean Vincent, ReverseRisk
 * Copyright (c) 2009, Alex R. Young
 * Licensed under the MIT license: http://github.com/uiteoi/ico/blob/master/MIT-LICENSE
 */"use strict";var Ico={Version:"0.98.2",extend:function(e,t){for(var n in t)e[n]=t[n];return e},isArray:function(e){return typeof e=="object"&&e instanceof Array}};(function(){var e=!0,t,n=typeof debug=="function";n||console.log?t=n?function(e){debug("Ico, "+e)}:function(e){function n(e,t){return e="000"+e,e.substr(e.length-t)}var t=new Date;console.log(n(t.getMinutes(),2)+":"+n(t.getSeconds(),2)+"."+n(t.getMilliseconds(),3)+" - "+"Ico, "+e)}:e=!1,Ico.extend(Ico,{Class:{add_methods:Ico.extend,create:function(e){var t=function(){this.initialize.apply(this,arguments)};t.subclasses=[];var n=-1;typeof e=="function"?(n+=1,(t.superclass=e).subclasses.push(t),t.prototype=Object.create(e.prototype)):t.superclass=null,t.prototype.constructor=t;while(++n<arguments.length)Ico.Class.add_methods(t.prototype,arguments[n]);return t.prototype.initialize||(t.prototype.initialize=function(){}),t}},get_style:function(e,t){var n="";return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(e,"").getPropertyValue(t):e.currentStyle&&(t=t.replace(/\-(\w)/g,function(e,t){return t.toUpperCase()}),n=e.currentStyle[t]),n},viewport_offset:Element.viewportOffset,significant_digits_round:function(e,t,n,r){if(e==0||e==Number.NEGATIVE_INFINITY||e==Number.POSITIVE_INFINITY)return e;var i=1;e<0&&(e=-e,i=-1);var s=Math.floor(Math.log(e)/Math.LN10);if(s<-14)return 0;s-=t-1,e=(n||Math.round)(i*e/Math.pow(10,s));if(r&&s<0){e*=i;while(e%10==0)s+=1,e/=10;e=""+e;var o=e.length+s;if(o<=0)return(i<0?"-":"")+"0.00000000000000".substring(0,2-o)+e;if(s<0)return(i<0?"-":"")+e.substring(0,o)+"."+e.substring(o);e*=i}return e*Math.pow(10,s)},root:function(e,t){return Math.floor(Math.log(Math.abs(e))/Math.log(t))},svg_path:function(e){var t="",n=!1;return e.forEach(function(e){typeof e=="number"?(n&&(t+=" "),t+=Math.round(e),n=!0):(t+=e,n=!1)}),t},adjust_min_max:function(n,r){e&&t("adjust_min_max(), min: "+n+", max: "+r);var i=r-n;return i===0?(n=0,r===0&&(r=1)):i<n?n-=i/2:n>0?n=0:i<-r?r+=i/2:r<0&&(r=0),[n,r]},series_min_max:function(n,r){e&&t("series_min_max: series length: "+n.length);var i=Array.prototype.concat.apply([],n).map(function(e){return e===undefined?null:e});e&&t("series_min_max: values length: "+i.length);if(i.length==0)throw"Series must have at least one value";var s=[Ico.significant_digits_round(Math.min.apply(Math,i),2,Math.floor),Ico.significant_digits_round(Math.max.apply(Math,i),2,Math.ceil)];return r||(s=Ico.adjust_min_max.apply(Ico,s)),s.push(i),s},moving_average:function(e,t,n){var r=[],i=-1,s=-1,o;n&&Ico.isArray(o=n.previous_values)&&(e=o.concat(e),i+=o.length);for(var u=e.length;++i<u;){var a=0;for(var f=-1;++f<t&&i>=f;)a+=e[i-f];r[++s]=Ico.significant_digits_round(a/f,3,Math.round,!0)}return r}}),Ico.Base=Ico.Class.create({initialize:function(n,r,i){return e&&t("Ico.Base.initialize( "+n+", "+JSON.stringify(r)+", "+JSON.stringify(i)+" )"),typeof n=="string"&&(n=document.getElementById(n)),this.element=n,this.series=r||[[0]],this.set_defaults(),this.set_series(),this.process_options(i),this.set_raphael(i=this.options),this.calculate(i),this.draw(i),e&&t("Ico.Base.initialize(), end"),this},set_series:function(){if(Ico.isArray(this.series))e&&t("set_series Array, element 0 is Array:"+Ico.isArray(this.series[0])),Ico.isArray(this.series[0])||(this.series=[this.series]);else{if(typeof this.series!="number")throw"Wrong type for series";this.series=[[this.series]]}this.data_samples=Math.max.apply(Math,this.series.map(function(n){return e&&t("serie length: "+n.length),n.length})),e&&t("set_series, data samples: "+this.data_samples);var n=Ico.series_min_max(this.series,!0);this.max=n[1],this.min=n[0],this.all_values=n[2],this.series_shapes=[]},set_defaults:function(){var n=this.options={width:parseInt(this.element.offsetWidth)-1,height:parseInt(this.element.offsetHeight)-1,x_padding_left:0,x_padding_right:0,y_padding_top:0,y_padding_bottom:0,color:Ico.get_style(this.element,"color"),mouseover_attributes:{stroke:"red"},units:"",units_position:1};e&&t("options: width: "+n.width+", height: "+n.height+", color: "+n.color)},process_options:function(n){e&&t("Ico.Base.process_options()");var r=this;n&&(n=Ico.extend(r.options,n)),typeof n.min!="undefined"&&(r.min=Math.min(r.min,n.min)),typeof n.max!="undefined"&&(r.max=Math.max(r.max,n.max)),r.range=r.max-r.min,r.x={direction:[1,0],start_offset:0,width:n.width},r.y={direction:[0,-1],start_offset:0,width:n.height},r.x.other=r.y,r.y.other=r.x,r.x.padding=[n.x_padding_left,n.x_padding_right],r.y.padding=[n.y_padding_top,n.y_padding_bottom],r.orientation=n.orientation||r.orientation||0,r.y_direction=r.orientation?-1:1,r.graph=r.orientation?{x:r.y,y:r.x}:{x:r.x,y:r.y},r.components=[];for(var i in Ico.Component.components){if(!Ico.Component.components.hasOwnProperty(i))continue;var s=r.options[i+"_attributes"],n=r.options[i],o=Ico.Component.components[i];n===!0&&s&&(n=r.options[i]=s);if(n){var u=o[1];r.components[u]||(r.components[u]=[]);try{r.components[u].push(r[i]=new o[0](r,n))}catch(a){r.error=a,e&&t("process_options(), exception: "+JSON.stringify(a))}}}},get_font:function(){var e=this.options;return this.font?this.font:(this.font={"font-family":Ico.get_style(this.element,"font-family"),"font-size":e.font_size||Ico.get_style(this.element,"font-size")||10,fill:Ico.get_style(this.element,"color")||"#666",stroke:"none"},e&&Ico.extend(this.font,e),this.font)},set_raphael:function(e){if(this.paper)return;this.paper=Raphael(this.element,e.width,e.height),this.svg=!(this.vml=Raphael.vml)},clear:function(){return this.paper&&(this.components_call("clear",this.options),this.paper.remove(),this.paper=null),this},calculate:function(n){e&&t("Ico.Base.calculate()"),this.paper||this.set_raphael(n),this.components_call("calculate",n),this.calculate_graph_len(this.graph.x),this.calculate_graph_len(this.graph.y),this.scale=this.y_direction*this.graph.y.len/this.range,this.graph.x.step=this.graph.x.len/this.label_slots_count(),this.x.start=this.x.padding[0],this.x.stop=this.x.start+this.x.len,this.y.stop=this.y.padding[0],this.y.start=this.y.stop+this.y.len},calculate_graph_len:function(e){e.len=e.width-e.padding[0]-e.padding[1]},calculate_bars:function(e){this.bar_width=this.graph.x.step-e.bar_padding,this.bar_width<5&&(this.bar_width=5),this.graph.x.start_offset=this.y_direction*this.graph.x.step/2,this.bar_base=this.graph.y.start-this.scale*((this.max<=0?this.max:0)-(this.min<0?this.min:0))},format_value:function(e,t){e!=0&&typeof t!="number"&&(t=Ico.root(e,1e3),t&&(e/=Math.pow(1e3,t)),e=Ico.significant_digits_round(e,3,Math.round,!0).toString()),e=""+e,t&&(e+=["","k","M","G","T","P","E","Z","Y"][t]||"e"+3*t);var n=this.options;return n.units?n.units_position?e+n.units:n.units+e:e},draw:function(n){return e&&t("Ico.Base.draw()"),this.paper||this.set_raphael(n),this.components_call("draw",n),this.draw_series(n),this},draw_series:function(e){for(var t=-1;++t<this.series.length;)this.series_shapes[t]={shape:this.draw_serie(this.series[t],t,e),visible:!0};this.highlight&&this.draw_highlight()},get_serie:function(e){e=this.series_shapes[e];if(e)return e;throw"Undefined serie"},toggle_serie:function(e){((e=this.get_serie(e)).visible^=1)&&e.shape.show()||e.shape.hide()},show_serie:function(e){(e=this.get_serie(e)).shape.show(),e.visible=!0},hide_serie:function(e){(e=this.get_serie(e)).shape.hide(),e.visible=!1},components_call:function(n,r){for(var i=-1;++i<this.components.length;){var s=this.components[i];if(!s)continue;for(var o=-1;++o<s.length;){var u=s[o];try{u[n]&&u[n](u.options,this)}catch(a){e&&t("Ico::Base::components_call(), exception "+JSON.stringify(a)),this.set_raphael(r),this.errors=(this.errors||0)+1,this.paper.text(0,12*this.errors,"Error in "+n+"(): "+(this.error=a)).attr({"text-anchor":"start","font-size":10,fill:"black",stroke:"none","font-family":"Arial"})}}}},plot:function(e){return(e-this.min)*this.scale},show_label_onmouseover:function(e,t,n,r,i,s){var o=this,u="";if(this.status_bar){if(!s){var a=this.labels,f,l=this.options.series_names;a&&(a=a.options.long_values||a.options.values)&&(f=a[i])&&(u+=f+", "),l&&(s=l[r])}s&&(u+=s+": "),u+=this.format_value(t)}e.node.onmouseout=function(){o.status_bar&&o.status_bar.shape.hide(),e.attr(n)},e.node.onmouseover=function(){o.status_bar&&o.status_bar.shape.attr({text:u}).show(),e.attr(o.options.mouseover_attributes)}}}),Ico.SparkLine=Ico.Class.create(Ico.Base,{process_options:function(e){Ico.Base.prototype.process_options.call(this,e),this.graph.y.padding[1]+=1;var t=this.options.highlight;t&&(this.highlight={index:this.data_samples-1,color:"red",radius:2},Ico.extend(this.highlight,t==1?{}:t),this.highlight.index==this.data_samples-1&&(this.graph.x.padding[1]+=this.highlight.radius+1))},label_slots_count:function(){return this.data_samples-1},draw_serie:function(e,t,n){var r=this,i=this.x.start+this.x.start_offset,s;return e.forEach(function(e){s=Ico.svg_path([s?s+"L":"M",i,r.y.start+r.y.start_offset-r.plot(e)]),i+=r.x.step}),this.paper.path(s).attr({stroke:n.color})},draw_highlight:function(){var e=this.highlight.index,t=this.x,n=this.y;this.paper.circle(Math.round(t.start+t.start_offset+e*t.step),Math.round(n.start+n.start_offset-this.plot(this.series[0][e])),this.highlight.radius).attr({stroke:"none",fill:this.highlight.color})}}),Ico.SparkBar=Ico.Class.create(Ico.SparkLine,{label_slots_count:function(){return this.data_samples},calculate:function(e){Ico.SparkLine.prototype.calculate.call(this,e),this.calculate_bars(e)},draw_serie:function(e,t,n){var r=this,i=this.x.start+this.x.start_offset,s="";return e.forEach(function(e){s+=Ico.svg_path(["M",i,r.bar_base,"v",-r.scale*e]),i+=r.x.step}),this.paper.path(s).attr({"stroke-width":this.graph.x.step,stroke:n.color})},draw_highlight:function(){var e=this.highlight.index,t=this.x;this.paper.path(Ico.svg_path(["M",t.start+t.start_offset+e*t.step,this.bar_base,"v",-this.scale*this.series[0][e]])).attr({"stroke-width":this.graph.x.step,stroke:this.highlight.color})}}),Ico.BulletGraph=Ico.Class.create(Ico.Base,{set_defaults:function(){Ico.Base.prototype.set_defaults.call(this),this.orientation=1,Ico.extend(this.options,{min:0,max:100,color:"#33e",graph_background:!0})},process_options:function(e){Ico.Base.prototype.process_options.call(this,e);var t=this.target={color:"#666",length:.8,"stroke-width":2};typeof e.target=="number"?t.value=e.target:Ico.extend(t,e.target||{})},label_slots_count:function(){return 1},calculate:function(e){Ico.Base.prototype.calculate.call(this,e),e.bar_padding||(e.bar_padding=2*this.graph.x.len/3),this.calculate_bars(e)},draw_series:function(e){var t=this.x.start+this.x.start_offset,n=this.y.start+this.y.start_offset,r=this.series[0][0],i,s=this.series_shapes[0]=this.paper.path(Ico.svg_path(["M",t-this.plot(r),n-this.bar_width/2,"H",this.bar_base,"v",this.bar_width,"H",t-this.plot(r),"z"])).attr(i={fill:e.color,"stroke-width":1,stroke:"none"});this.show_label_onmouseover(s,r,i,0,0);if(typeof this.target.value!="undefined"){var o=this.target,u=1-o.length,n=this.y;this.paper.path(Ico.svg_path(["M",t-this.plot(o.value),n.len*u/2,"v",n.len*(1-u)])).attr({stroke:o.color,"stroke-width":o["stroke-width"]})}}}),Ico.BaseGraph=Ico.Class.create(Ico.Base,{set_defaults:function(){Ico.Base.prototype.set_defaults.call(this),Ico.extend(this.options,{y_padding_top:15,y_padding_bottom:10,x_padding_left:10,x_padding_right:10,colors:[],series_attributes:[],value_labels:{},focus_hint:!0,axis:!0})},process_options:function(e){var t=this,n=Ico.adjust_min_max(this.min,this.max);this.min=n[0],this.max=n[1],Ico.Base.prototype.process_options.call(this,e),this.series.forEach(function(e,n){t.options.colors[n]||(t.options.colors[n]=t.options.color||Raphael.hsb2rgb(Math.random(),1,.75).hex)})},draw_serie:function(e,t,n){var r=this.graph.x.start+this.graph.x.start_offset,i=this.graph.y.start+this.graph.y.start_offset+this.scale*this.min,s=this.paper.path(),o="",u=this.paper.set();for(var a=-1;++a<e.length;){var f=e[a];f==null?this.last=null:o+=this.draw_value(a,r,i-this.scale*f,f,t,u,n),r+=this.y_direction*this.graph.x.step}return o!=""&&(s.attr({path:o}).attr(n.series_attributes[t]||{stroke:n.colors[t],"stroke-width":n.stroke_width||3}),u.push(s)),u}}),Ico.LineGraph=Ico.Class.create(Ico.BaseGraph,{set_defaults:function(){Ico.BaseGraph.prototype.set_defaults.call(this),Ico.extend(this.options,{curve_amount:5,dot_radius:3,dot_attributes:[],focus_radius:6,focus_attributes:{stroke:"none",fill:"white","fill-opacity":0}})},process_options:function(e){Ico.BaseGraph.prototype.process_options.call(this,e);var t=this;this.series.forEach(function(e,n){var r=t.options.colors[n];t.options.series_attributes[n]||(t.options.series_attributes[n]={stroke:r,"stroke-width":2}),t.options.dot_attributes[n]||(t.options.dot_attributes[n]={"stroke-width":1,stroke:t.background?t.background.options.color:r,fill:r})})},label_slots_count:function(){return this.data_samples-1},draw_value:function(e,t,n,r,i,s,o){var u=o.dot_radius,a=o.focus_radius,f;this.orientation&&(f=t,t=n,n=f),typeof u=="object"&&(u=u[i]),u&&s.push(this.paper.circle(t,n,u).attr(o.dot_attributes[i])),typeof a=="object"&&(a=a[i]);if(a){var l=o.focus_attributes,c=this.paper.circle(t,n,a).attr(l);s.push(c),this.show_label_onmouseover(c,r,l,i,e)}var h,p=o.curve_amount,d=this.last;if(e==0||p&&!d)h=["M",t,n];else if(p){i=this.series[i];var v=this.scale*p/2/this.graph.x.step,m=i[e-1],g=i[e-2],y=i[e],b=i[e+1],w=[p,(g!==undefined?g-y:(m-y)*2)*v],E=[p,(b!==undefined?m-b:(m-y)*2)*v];this.orientation&&(w=[w[1],-p],E=[E[0],-p]);var S=d[0]+w[0],y=d[1]+w[1],x=t-E[0],b=n-E[1];if(o.debug&&i===this.series[0]){var T={stroke:"black"},N={stroke:"red"};this.paper.circle(S,y,1).attr(T),this.paper.path(Ico.svg_path(["M",d[0],d[1],"L",S,y])).attr(T),this.paper.circle(x,b,1).attr(N),this.paper.path(Ico.svg_path(["M",t,n,"L",x,b])).attr(N)}h=["C",S,y,x,b,t,n]}else h=["L",t,n];return p&&(this.last=[t,n]),Ico.svg_path(h)}}),Ico.BarGraph=Ico.Class.create(Ico.BaseGraph,{set_defaults:function(){Ico.BaseGraph.prototype.set_defaults.call(this);var e=this.options;e.bar_padding=5,e.bars_overlap=.5},process_options:function(e){Ico.BaseGraph.prototype.process_options.call(this,e);var t=this;e=t.options,this.series.forEach(function(n,r){var i=e.series_attributes;i[r]||(i[r]={stroke:"none","stroke-width":2,gradient:""+(t.orientation?270:0)+"-"+e.colors[r]+":20-#555555"})}),e.bars_overlap>1&&(e.bars_overlap=1)},calculate:function(e){Ico.BaseGraph.prototype.calculate.call(this,e),this.calculate_bars(e),e=this.bars_overlap=e.bars_overlap;var t=this.series.length,n=this.bars_width=this.bar_width/(t-(t-1)*e);this.bars_step=n*(1-e)},label_slots_count:function(){return this.data_samples},draw_value:function(e,t,n,r,i,s,o){var u=o.series_attributes[i],a=this.bars_width,f=this.bar_base,l;return Math.abs(n-f)<2&&(n=f+(n>=f?2:-2)),t+=this.bars_step*i-this.bar_width/2,this.show_label_onmouseover(l=this.paper.path(Ico.svg_path(this.orientation?["M",n,t,"H",f,"v",a,"H",n,"z"]:["M",t,n,"V",f,"h",a,"V",n,"z"])).attr(u),r,u,i,e),s.push(l),""}}),Ico.HorizontalBarGraph=Ico.Class.create(Ico.BarGraph,{set_defaults:function(){Ico.BarGraph.prototype.set_defaults.call(this),this.orientation=1}}),Ico.Component=Ico.Class.create({initialize:function(n,r){Ico.extend(this,{p:n,graph:n.graph,x:n.x,y:n.y,orientation:n.orientation});if(Ico.isArray(r))r={values:r};else if(typeof r=="number"||typeof r=="string")r={value:r};r=this.options=this.defaults?Ico.extend(this.defaults(n),r):r,e&&t("Ico.Component::initialize(), o: "+JSON.stringify(r)),this.process_options&&this.process_options(r,n)}}),Ico.Component.components={},Ico.Component.Background=Ico.Class.create(Ico.Component,{defaults:function(){return{corners:!0}},process_options:function(e){e.color&&!e.attributes&&(e.attributes={stroke:"none",fill:e.color}),e.attributes&&(e.color=e.attributes.fill),e.corners===!0&&(e.corners=Math.round(this.p.options.height/20))},draw:function(e,t){var n=t.options;this.shape=t.paper.rect(0,0,n.width,n.height,e.corners).attr(e.attributes)}}),Ico.Component.components.background=[Ico.Component.Background,0],Ico.Component.StatusBar=Ico.Class.create(Ico.Component,{defaults:function(){return{attributes:{"text-anchor":"end"}}},draw:function(e,t){var n=t.options,r=this.y;this.shape=t.paper.text(e.x||n.width-10,e.y||(r?r.padding[0]:n.height)/2,"").hide().attr(e.attributes)}}),Ico.Component.components.status_bar=[Ico.Component.StatusBar,2],Ico.Component.MousePointer=Ico.Class.create(Ico.Component,{defaults:function(){return{attributes:{stroke:"#666","stroke-dasharray":"--"}}},draw:function(e,t){if(!Ico.viewport_offset)return;var n=this.shape=t.paper.path().attr(e.attributes).hide(),r=this.x,i=this.y,s=t.element;s.onmousemove=function(e){e=e||window.event;var t=Ico.viewport_offset(s),o=e.clientX-t[0],u=e.clientY-t[1];o>=r.start&&o<=r.stop&&u>=i.stop&&u<=i.start?n.attr({path:Ico.svg_path(["M",r.start,u,"h",r.len,"M",o,i.stop,"v",i.len])}).show():n.hide()},s.onmouseout=function(){n.hide()}}}),Ico.Component.components.mouse_pointer=[Ico.Component.MousePointer,2],Ico.Component.GraphBackground=Ico.Class.create(Ico.Component,{defaults:function(){return{key_colors:["#aaa","#ccc","#eee"],key_values:[50,75],colors_transition:0}},draw:function(e,t){var n=this.x,r=this.y,i=t.range,s=e.colors_transition/i,o=100/i-s,u=e.key_colors,a=u.length,f=e.key_values,l=f.length,c=this.orientation?"0":"90";a>l+1&&(a=l+1);for(var h,p=0,d=-1;++d<a;p=h){var v=d<l,m=v?h=f[d]-t.min:i,g="-"+u[d]+":";d&&(c+=g+Math.round(p*o+m*s)),v&&(c+=g+Math.round(p*s+m*o))}this.shape=t.paper.rect(n.start,r.stop,n.len,r.len).attr({gradient:c,stroke:"none"})}}),Ico.Component.components.graph_background=[Ico.Component.GraphBackground,1],Ico.Component.Grid=Ico.Class.create(Ico.Component,{defaults:function(){return{stroke:"#eee","stroke-width":1}}}),Ico.Component.components.grid=[Ico.Component.Grid,0],Ico.Component.Labels=Ico.Class.create(Ico.Component,{defaults:function(e){return{marker_size:5,angle:0,add_padding:!0,position:0,grid:e.grid?e.grid.options:undefined}},process_options:function(e,t){var n=e.title;Ico.extend(this.font=Ico.extend({},t.get_font()),e.font||{}),this.markers_attributes={stroke:this.font.fill,"stroke-width":1},Ico.extend(this.markers_attributes,e.markers_attributes),n&&(this.title=n.value,Ico.extend(this.title_font=this.font,e.title_font)),this.x.angle=0,this.y.angle=-90},calculate:function(e){this.calculate_labels_padding(this.graph.x,1,e)},calculate_labels_padding:function(e,t,n){var r=e.direction[0],i=e.direction[1],s=n.marker_size,o=[];if((e.labels=n.values)===undefined){n.values=e.labels=[];for(p=0;++p<=this.data_samples;)e.labels[p]=p}var u=e.angle+=n.angle;if(e.labels){var a=this.get_labels_bounding_boxes(e),f=e.font_size=a[1];if(u%180){u=u*Math.PI/180;var l=Math.abs(Math.sin(u)),c=Math.abs(Math.cos(u));e.f=[f*c/2,f*l/2+s],o[1]=Math.round(a[0]*l+e.f[1]+e.f[0]),r?u<0^n.position&&(e.f[0]=-e.f[0]):e.f=[-e.f[1],0];if(this.p.vml){var h=2.2;i&&(u+=Math.PI/2),e.f[0]-=h*Math.sin(u),e.f[1]+=h*Math.cos(u)}e.anchor=i?n.position?"start":"end":u>0^n.position?"start":"end"}else{var n=.6*f+s;e.f=[i*n,r*n],o[1]=a[1]*1.1+s,e.anchor="middle"}}var p=t^this.orientation^n.position;n.add_padding?e.other.padding[p]+=o[1]:e.other.padding[p]<o[1]&&(e.other.padding[p]=o[1])},get_labels_bounding_boxes:function(e){if(this.labels)return this.bbox;this.labels=[],this.bboxes=[],this.bbox=[0,0];var t=this,n=0;return e.labels.forEach(function(e){typeof e=="undefined"&&(e=""),t.labels.push(e=t.p.paper.text(10,10,e.toString()).attr(t.font)),t.bboxes.push(e=e.getBBox()),e.width>n&&(t.bbox=[n=e.width,e.height])}),this.bbox},clear:function(){this.labels=null},text_size:function(e,t){var n=this.p.paper.text(10,10,"").attr(t).attr({text:e}),r,i;return i=n.getBBox(),r=[i.width,i.height],n.remove(),r},draw:function(e){this.draw_labels_grid(this.graph.x,e)},draw_labels_grid:function(e,t){var n=this,r=e.direction[0],i=e.direction[1],s=e.step,o=this.x.start+this.x.start_offset*r,u=this.y.start-this.y.start_offset*i,a=t.marker_size,f=e.f[0],l=e.f[1],c=e.angle,h=this.p.paper,p=t.grid,d=r?"v-"+n.y.len:"h"+n.x.len,v=0,m=0;if(p&&p.through){d+=e.padding[1]+10;var g=-e.padding[0]-this.bbox[0]-a-20;r?m=g:v=g}i&&(c+=90);var y=[],b=[];this.labels||this.get_labels_bounding_boxes(e),this.labels.forEach(function(t,n){a&&y.push("M",o,u,r?"v":"h-",a),p&&b.push("M",o+(e.labels[n]?0:v),u+(e.labels[n]?0:m),d);var h=o+f,g=u+l;t.attr({x:h,y:g,"text-anchor":e.anchor}).toFront(),c&&t.rotate(c,h,g),r&&(o+=s),i&&(u-=s)}),a&&h.path(Ico.svg_path(y)).attr(this.markers_attributes),p&&(r&&b.push("M",this.x.start," ",this.y.stop,"h",this.x.len,"v",this.y.len),h.path(Ico.svg_path(b)).attr(p))}}),Ico.Component.components.labels=[Ico.Component.Labels,3],Ico.Component.ValueLabels=Ico.Class.create(Ico.Component.Labels,{calculate:function(n,r){e&&t("Ico.Component.ValueLabels.calculate()");var i=this,s=r.max,o=r.min,u=s-o,a=n.spaces,f;r.calculate_graph_len(this.graph.y);if(!a){var l=Math.abs(n.angle),c;this.orientation&&l<30||!this.orientation&&l>60?c=Math.max.apply(Math,[o,s].map(function(e){return i.text_size("0"+Ico.significant_digits_round(e,3,Math.round,!0)+i.p.options.units,i.font)[0]})):c=1.5*this.text_size("0",this.font)[1],a=Math.round(this.graph.y.len/c);if(a>2){var h=u,p=a;for(var d=1;++d<=p;)f=i.calculate_value_labels_params(o,s,u,d),f.waste<=h&&(h=f.waste,a=d)}}f=this.calculate_value_labels_params(o,s,u,a),r.range=(r.max=f.max)-(r.min=f.min);var v=Ico.root(f.step*f.spaces,1e3);if(v){var m=Math.pow(1e3,v);f.step/=m,f.min/=m}var g=n.values=[],y=0;for(var b=f.min,w=-1;++w<=f.spaces;b+=f.step){var E=Ico.significant_digits_round(b,3,Math.round,!0).toString(),S=(E+".").split(".")[1].length;S>y&&(y=S),g.push(E)}g.forEach(function(e,t){var n=(e+".").split(".")[1].length;n<y&&(n==0&&(e+="."),e+="0000".substring(0,y-n)),g[t]=i.p.format_value(e,v)}),this.graph.y.step=this.graph.y.len/f.spaces,this.calculate_labels_padding(this.graph.y,0,n)},calculate_value_labels_params:function(e,t,n,r){if(e<0&&t>0){var i=Math.round(r*t/n);i==0?i=1:i==r&&(i-=1);var s=r-i,o=Ico.significant_digits_round(Math.max(t/i,-e/s),2,function(e){e=Math.ceil(e);if(e<=10)return e;if(e<=12)return 12;var t;return e<=54?(t=e%5)?e-t+5:e:(t=e%10)?e-t+10:e});e=-o*s,t=o*i}else{var o=Ico.significant_digits_round(n/r,1,Math.ceil);t<=0?e=t-o*r:e>=0&&(t=e+o*r)}return{min:e,max:t,spaces:r,step:o,waste:r*o-n}},draw:function(e){this.draw_labels_grid(this.graph.y,e)}}),Ico.Component.components.value_labels=[Ico.Component.ValueLabels,4],Ico.Component.Meanline=Ico.Class.create(Ico.Component,{defaults:function(){return{attributes:{stroke:"#bbb","stroke-width":2}}},calculate:function(){var n=this.p.all_values;this.mean=Ico.significant_digits_round(n.reduce(function(e,t){return e+t},0)/n.length,3,Math.round,!0),e&&t("Ico.Component.Meanline, calculate, len: "+n.length+", mean="+this.mean)},draw:function(e,t){var n=e.attributes;if(!n)return;var r=this.graph.y.start-t.plot(this.mean);this.graph.y.mean={start:r,stop:r},this.graph.x.mean=this.graph.x,this.shape=t.paper.path(Ico.svg_path(["M",this.x.mean.start,this.y.mean.start,"L",this.x.mean.stop,this.y.mean.stop])).attr(n),t.show_label_onmouseover(this.shape,this.mean,n,0,0,"Average")}}),Ico.Component.components.meanline=[Ico.Component.Meanline,3],Ico.Component.FocusHint=Ico.Class.create(Ico.Component,{defaults:function(){return{length:6,attributes:{"stroke-width":2,stroke:this.p.get_font().fill}}},draw:function(e,t){if(t.min==0)return;var n=e.length,r=Ico.svg_path(["l",n,n]);this.shape=t.paper.path(Ico.svg_path(this.orientation?["M",this.x.start,this.y.start-n/2,r,"m0-",n,r]:["M",this.x.start-n/2,this.y.start-2*n,r+"m-",n," 0"+r])).attr(e.attributes)}}),Ico.Component.components.focus_hint=[Ico.Component.FocusHint,5],Ico.Component.Axis=Ico.Class.create(Ico.Component,{defaults:function(){return{attributes:{stroke:"#666","stroke-width":1}}},draw:function(e){var t=this.x,n=this.y;this.shape=this.p.paper.path(Ico.svg_path(["M",t.start,n.stop,"v",n.len,"h",t.len])).attr(e.attributes)}}),Ico.Component.components.axis=[Ico.Component.Axis,4]})();// ECMAScript 5 compatibility functions
//
// Copyright (c) 2011, Jean Vincent
// 
// Licensed under the MIT license
//
Object.keys||(Object.keys=function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t}),Object.create||(Object.create=function(e){function t(){}if(arguments.length>1)throw new Error("Object.create implementation only accepts the first parameter.");return t.prototype=e,new t}),Function.prototype.bind||(Function.prototype.bind=function(e){if(typeof this!="function")throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=this,n=Array.prototype.slice,r=n.call(arguments,1),i=function(){return t.apply(e||{},r.concat(n.call(arguments)))};return i.prototype=this.prototype,i}),Array.prototype.indexOf||(Array.prototype.indexOf=function(e,t){var n=this.length;if(n===0)return-1;t===undefined?t=0:t<0&&(t+=n)<0&&(t=0),t-=1;while(++t<n)if(this[t]===e)return t;return-1}),Array.prototype.lastIndexOf||(Array.prototype.lastIndexOf=function(e,t){var n=this.length;if(n===0)return-1;if(t===undefined)t=n-1;else{if(t<0&&(t+=n)<0)return-1;t>=n&&(t=n-1)}t+=1;while(--t>=0&&this[t]!==e);return t}),Array.prototype.forEach||(Array.prototype.forEach=function(e,t){t||(t=window);var n=-1;while(++n<this.length)n in this&&e.call(t,this[n],n,this)}),Array.prototype.every||(Array.prototype.every=function(e,t){t||(t=window);var n=-1;while(++n<this.length)if(n in this&&!e.call(t,this[n],n,this))return!1;return!0}),Array.prototype.some||(Array.prototype.some=function(e,t){t||(t=window);var n=-1;while(++n<this.length)if(n in this&&e.call(t,this[n],n,this))return!0;return!1}),Array.prototype.map||(Array.prototype.map=function(e,t){t||(t=window);var n=[],r=-1;while(++r<this.length)r in this&&(n[r]=e.call(t,this[r],r,this));return n}),Array.prototype.filter||(Array.prototype.filter=function(e,t){t||(t=window);var n=[],r,i=this.length,s=-1;while(++s<i)s in this&&e.call(t,r=this[s],s,this)&&n.push(r);return n}),Array.prototype.reduce||(Array.prototype.reduce=function(e,t){var n=-1;t===undefined&&(t=this[++n]);while(++n<this.length)n in this&&(t=e(t,this[n],n,this));return t}),Array.prototype.reduceRight||(Array.prototype.reduceRight=function(e,t){var n=this.length;t===undefined&&(t=this[--n]);while(--n>=0)n in this&&(t=e(t,this[n],n,this));return t});/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*//*jslint evil: true, strict: false, regexp: false *//*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
var JSON;JSON||(JSON={}),function(){"use strict";function f(e){return e<10?"0"+e:e}function quote(e){return escapable.lastIndex=0,escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return typeof t=="string"?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,r,i,s,o=gap,u,a=t[e];a&&typeof a=="object"&&typeof a.toJSON=="function"&&(a=a.toJSON(e)),typeof rep=="function"&&(a=rep.call(t,e,a));switch(typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";gap+=indent,u=[];if(Object.prototype.toString.apply(a)==="[object Array]"){s=a.length;for(n=0;n<s;n+=1)u[n]=str(n,a)||"null";return i=u.length===0?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+o+"]":"["+u.join(",")+"]",gap=o,i}if(rep&&typeof rep=="object"){s=rep.length;for(n=0;n<s;n+=1)typeof rep[n]=="string"&&(r=rep[n],i=str(r,a),i&&u.push(quote(r)+(gap?": ":":")+i))}else for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(i=str(r,a),i&&u.push(quote(r)+(gap?": ":":")+i));return i=u.length===0?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+o+"}":"{"+u.join(",")+"}",gap=o,i}}typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(e){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(e){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(e,t,n){var r;gap="",indent="";if(typeof n=="number")for(r=0;r<n;r+=1)indent+=" ";else typeof n=="string"&&(indent=n);rep=t;if(!t||typeof t=="function"||typeof t=="object"&&typeof t.length=="number")return str("",{"":e});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(e,t){var n,r,i=e[t];if(i&&typeof i=="object")for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(r=walk(i,n),r!==undefined?i[n]=r:delete i[n]);return reviver.call(e,t,i)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();