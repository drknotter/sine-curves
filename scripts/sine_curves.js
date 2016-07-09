/*
Sine Curves - A Javascript program for viewing multiple sine curves.
Copyright (C) 2013  Pat Plunkett

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Author email: patplunkett@gmail.com
*/

var pi = 3.14159265358979323846;
var sine_curves = [];
var margins = [20,20,30,30]; // top, right, bottom, left
var x_lims = [-5,8];
var h_percent = 0.6;
var colors = ['#000000','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff'];
var color_count = [0,0,0,0,0,0,0];

var svg;

function initialize() {

    var w = window.innerWidth-5;
    var h = window.innerHeight-5;

    sine_curves.push({amplitude:1,period:3.1,phase:0,color:colors[0]});
    color_count[0] += 1;

    svg = d3.select('body').append('svg')
        .attr('width',w).attr('height',h_percent*h);
    
    svg.append('rect').attr('class','background')
        .attr('width',w).attr('height',h_percent*h)
        .attr('fill','#ddd');
    
    svg.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate("+margins[3]+","+(h_percent*h-margins[2])+")");
    svg.append("g")
        .attr("class", "y grid")
        .attr("transform", "translate("+margins[3]+","+margins[0]+")");
    svg.append('path')
        .attr('class','x axis')
        .attr("transform", "translate("+margins[3]+","+margins[0]+")");
    svg.append('path')
        .attr('class','y axis')
        .attr("transform", "translate("+margins[3]+","+margins[0]+")");

    svg.append('g').attr('class','curveGroup');

    d3.select('body').append('div').attr('class','controlGroup')
    draw_controls();

    d3.select('body').append('div')
        .style('background-color','#aaa')
        .style('width','100px')
        .style('margin','10px')
        .style('padding','10px')
        .style('color','#fff')
        .style('font-weight','bold')
        .style('text-align','center')
        .style('cursor','pointer')
        .text('New Curve')
        .on('click',add_curve);
        
    draw_axes();
    draw_curves();
    
}

function add_curve() {

    var cIndex=0;
    for( var i=0; i<color_count.length; i++ ) {
        if( color_count[i] < color_count[cIndex] )
            cIndex = i;
    }
    color_count[cIndex] += 1;
    sine_curves.push({amplitude:1.0,period:3.1,phase:0.0,color:colors[cIndex]});
    draw_controls();
    draw_curves();

}

function remove_curve(d,i) {
    
    var c = d3.rgb(this.style['background-color']).toString();
    var cIndex;
    for( cIndex=0; cIndex<colors.length; cIndex++ ) {
        if( colors[cIndex] == c )
            break;
    }
    color_count[cIndex] -= 1;
    sine_curves.splice(i,1);
    draw_controls();
    draw_curves();
    
}

function draw_controls() {

    d3.select('.controlGroup').selectAll('.control').remove();
    var controlGroup = d3.select('.controlGroup').selectAll('.control').data(sine_curves);
    
    var controls = controlGroup.enter().append('div')
        .attr('class','control')
        .style('margin','10px 10px 0px 10px');

    controls.append('div')
        .style('display','inline-block')
        .style('margin','0px 10px 0px 0px')
        .style('vertical-align','middle')
        .style('width','20px').style('height','20px')
        .style('background-color',function(d){return d.color;})
        .style('color','#fff')
        .style('text-align','center')
        .style('cursor','pointer')
        .style('font-weight','bold')
        .text('x')
        .on('click',remove_curve);

    var ctrl = controls.append('div')
        .style('display','inline-block')
        .style('margin','0px 10px 0px 0px')
        .style('vertical-align','middle');

    ctrl.append('div').attr('class','amplitudeText')
        .text(function(d){return 'Amplitude: '+Number(d.amplitude).toFixed(1);});
    
    ctrl.append('input')
        .attr('type','range')
        .attr('min','-2').attr('max','2')
        .attr('value',function(d){return d.amplitude;})
        .attr('step','0.1')
        .style('display','block')
        .on('change',function(d){
                d.amplitude = Number(this.value);
                d3.select(this.parentElement).select('.amplitudeText')
                    .text('Amplitude: '+Number(d.amplitude).toFixed(1));
                d3.select(this.parentElement.parentElement).select('.functionText')
                    .html(functionText(d));
                draw_curves(true);
            });

    var ctrl = controls.append('div')
        .style('display','inline-block')
        .style('margin','0px 10px 0px 0px')
        .style('vertical-align','middle');

    ctrl.append('div').attr('class','periodText')
        .text(function(d){return 'Period: '+Number(d.period).toFixed(1);});
    
    ctrl.append('input')
        .attr('type','range')
        .attr('min','0.5').attr('max','8')
        .attr('value',function(d){return d.period;})
        .attr('step','0.1')
        .style('display','block')
        .on('change',function(d){
                d.period = Number(this.value);
                d3.select(this.parentElement).select('.periodText')
                    .text('Period: '+Number(d.period).toFixed(1));
                d3.select(this.parentElement.parentElement).select('.functionText')
                    .html(functionText(d));
                draw_curves(true);
            });

    var ctrl = controls.append('div')
        .style('display','inline-block')
        .style('margin','0px 10px 0px 0px')
        .style('vertical-align','middle');

    ctrl.append('div').attr('class','phaseText')
        .text(function(d){return 'Phase Shift: '+Number(d.phase).toFixed(1);});
    
    ctrl.append('input')
        .attr('type','range')
        .attr('min','-2').attr('max','2')
        .attr('value',function(d){return d.phase;})
        .attr('step','0.1')
        .style('display','block')
        .on('change',function(d){
                d.phase = Number(this.value);
                d3.select(this.parentElement).select('.phaseText')
                    .text('Phase Shift: '+Number(d.phase).toFixed(1));
                d3.select(this.parentElement.parentElement).select('.functionText')
                    .html(functionText(d));
                draw_curves(true);
            });

    var ctrl = controls.append('div')
        .attr('class','functionText')
        .style('display','inline-block')
        .style('margin','0px 10px 0px 0px')
        .style('vertical-align','middle')
        .style('font-size','20px')
        .style('font-family','Georgia')
        .html(functionText);

}

function functionText(d) {
    var A = Number(d.amplitude).toFixed(1);
    var p = Number(d.period).toFixed(1);
    var phi = Number(d.phase).toFixed(1);
    if( phi >= 0 )
        return A+' &sdot; sin<large>(</large> <sup>2&pi;</sup>&frasl;<sub>'+p+'</sub>(<i>x</i> - '+phi+') <large>)</large>';
    else
        return A+' &sdot; sin<large>(</large> <sup>2&pi;</sup>&frasl;<sub>'+p+'</sub>(<i>x</i> + '+(-phi)+') <large>)</large>';
}

function draw_axes() {
    
    var w = window.innerWidth-5;
    var h = h_percent*(window.innerHeight-5);
    
    var aspect_ratio = (h-margins[0]-margins[2])/(w-margins[1]-margins[3]);
    var y_lims = [-(x_lims[1]-x_lims[0])/2*aspect_ratio,
                  (x_lims[1]-x_lims[0])/2*aspect_ratio];
    
    var x_tix = [], y_tix = [];
    for( var i=Math.ceil(x_lims[0]); i<=x_lims[1]; i++ )
        x_tix.push(i);
    for( var i=Math.ceil(y_lims[0]); i<=y_lims[1]; i++ )
        y_tix.push(i);
    
    var x_scale = d3.scale.linear().domain(x_lims)
        .range([0,w-margins[3]-margins[1]]);
    var y_scale = d3.scale.linear().domain(y_lims)
        .range([h-margins[0]-margins[2],0]);
    
    svg.select('.x.grid')
        .attr("transform", "translate("+margins[3]+","+(h-margins[2])+")")
        .call(d3.svg.axis().scale(x_scale)
              .tickSize(-(h-margins[0]-margins[2]))
              .tickSubdivide(3).tickValues(x_tix)
              .tickFormat(d3.format('d')));
    svg.select('.y.grid')
        .attr("transform", "translate("+margins[3]+","+margins[0]+")")
        .call(d3.svg.axis().scale(y_scale)
              .tickSize(-(w-margins[1]-margins[3]))
              .tickSubdivide(3).tickValues(y_tix)
              .tickFormat(d3.format('d'))
              .orient('left'));

    var x0 = (w-margins[1]-margins[3])/(x_lims[1]-x_lims[0])*(0-x_lims[0]);
    var y0 = (h-margins[0]-margins[2])/(y_lims[1]-y_lims[0])*(0-y_lims[0]);
    svg.select('.x.axis')
        .attr('d',function(){
                if( 0 < y_lims[1] && 0 > y_lims[0] )
                    return 'M0 '+y0+'L'+(w-margins[1]-margins[3])+' '+y0;
                else
                    return '';
            });
    svg.select('.y.axis')
        .attr('d',function(){
                if( 0 < x_lims[1] && 0 > x_lims[0] )
                    return 'M'+x0+' 0L'+x0+' '+(h-margins[1]-margins[3]);
                else
                    return '';
            });
    
}

function draw_curves() {
    
    var w = window.innerWidth-5;
    var h = h_percent*(window.innerHeight-5);
    
    var aspect_ratio = h/w;
    var y_lims = [-(x_lims[1]-x_lims[0])/2*aspect_ratio,
                  (x_lims[1]-x_lims[0])/2*aspect_ratio];
    
    var x_offset = margins[3];
    var y_offset = margins[0]+(h-margins[0]-margins[2])/2;
    var scale = (w-margins[1]-margins[3])/(x_lims[1]-x_lims[0]);
    
    function init_curve_data(d) {
        var path_data = 'M ';
        path_data += (x_offset);
        path_data += ' ';
        path_data += (y_offset);
        for( var i=1; i<=200; i++ ) {
            path_data += ' L ';
            path_data += (i*(w-margins[1]-margins[3])/200+x_offset);
            path_data += ' ';
            path_data += (y_offset);
        }
        return path_data;        
    }
    
    function gen_curve_data(d) {
        var path_data = 'M ', x;
        path_data += (x_offset);
        path_data += ' ';
        path_data += -scale*d.amplitude*Math.sin(2*pi/d.period*(x_lims[0]-d.phase))+y_offset;
        for( var i=1; i<=200; i++ ) {
            path_data += ' L ';
            x = i*(x_lims[1]-x_lims[0])/200+x_lims[0];
            path_data += (i*(w-margins[1]-margins[3])/200+x_offset);
            path_data += ' ';
            path_data += -scale*d.amplitude*Math.sin(2*pi/d.period*(x-d.phase))+y_offset;
        }
        return path_data;        
    }
    
    svg.select('g.curveGroup').selectAll('.curve').remove();
    var curves = svg.select('g.curveGroup').selectAll('.curve').data(sine_curves);
    
    curves.enter().append('svg:path').attr('class','curve')
        .attr('stroke-width','5px')
        .attr('stroke',function(d){return d.color;})
        .attr('fill','none')
        .attr('stroke-linejoin','round');
        
    curves.attr('d',gen_curve_data);
    
}

function draw() {
    
    var w = window.innerWidth-5;
    var h = window.innerHeight-5;

    svg.attr('width',w).attr('height',h_percent*h);
    svg.select('.background')
        .attr('width',w).attr('height',h_percent*h)

    draw_axes();
    draw_curves(false);

}
