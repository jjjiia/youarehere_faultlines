var config = {
	zoom: .95,
	timeline: {
		timer: null,
		width: 1100,
		barWidth: 6,
		// TODO: Update this and remove this "magic" constant for the width '1100'
		xScale: d3.scale.linear().domain([1880,2014]).range([20, 950])
	}
}
var global = {
	center:[-118.3, 34.15],
    scale:150000,
	translate:[0,0],
	translateScale:1,
    sacleExtent:[1,20]
}
$(function() {
	queue()
		.defer(d3.json, blockGroup)
		.defer(d3.csv, race)
        .defer(d3.json,overlap)
        .await(dataDidLoad);
})

$("#topDifferences .hideTop").hide()

function dataDidLoad(error,blockGroup,race,overlap) {
    d3.select("#map").append("svg")
	window.location.hash = JSON.stringify([global.translate, global.translateScale])
    console.log(blockGroup)
    drawBlockGroups(blockGroup)
   
    var raceHeaders = d3.keys(race[0])
    //["id1", "id2", "total_population", "some_other_race_alone", "white_alone", "two_or_more_races", "asian_alone", "black_or_african_american_alone", "american_indian_and_alaska_native_alone", "native_hawaiian_and_other_pacific_islander_alone"]

    var raceData = raceDataByGroup
    var raceColors = ["#E38B3A","#8C6A3C","#EABF73","#EEB02F","#BA8E30","#A46429","#CD9C66"]
    initTopDifferences(raceData,overlap,raceColors,0)
    
    var higherEducationData = higherEducationByGroup
    var edColors = ["#86D366","#669150","#55DB35","#58DE90","#6A9E27","#97D43B","#66BA82","#A7C76D","#4DDB64","#3D9F40"]
    initTopDifferences(higherEducationData,overlap,edColors,1)
    
    var transportationData = transportationByGroup
    var transColors = ["#4E60B2","#2B303C","#3A7699","#696A72","#345186","#4F7BE4","#2A385C","#5379BC","#6A7297","#366CCA"]
    initTopDifferences(higherEducationData,overlap,transColors,2)
    //addLandmarks()
    
    var occupancyColors = ["#E76E6F","#E83923","#A47460","#AE4D34","#D63941","#D6365F","#A65557","#E39B85","#DB5B33","#C17250"]
    initTopDifferences(occupancyByGroup,overlap,occupancyColors,3)
    
}
function addLandmarks(){
	var projection = d3.geo.equirectangular().scale(global.scale).center(global.center)
    var landmarks = [["Santa Monica",34.012936, -118.496271],["Beverly Hills",34.072582, -118.397367],["Pasadena",34.147465, -118.147165]]
    var map = d3.select("#map svg").append("g")
    
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
    
    map.selectAll(".landmarks")
    .data(landmarks)
    .enter()
    .append("text")
    .attr("class",".map-item")
    .text(function(d){return d[0]})
    .attr("x",function(d){return projection([d[2],d[1]])[0]})
    .attr("y",function(d){return projection([d[2],d[1]])[1]})
    .attr("opacity", 1)
    .call(zoom);
        
}


function initTopDifferences(data,overlap,colors,offset){
    //var colors = ["#66A444","#C055C3","#CB5036","#4B8980","#AE5271","#7477B7","#9B7831","#66A444","#C055C3","#CB5036","#4B8980","#AE5271","#7477B7","#9B7831"]
    var colorIndex = 0
    
    var categories = []
    for(var i in data){
        categories.push([i,colors[colorIndex]])
        for(var j in data[i]){
            var row = data[i][j]
            var id1 = row[0]
            var id2 = row[1]
            var percentDifference = row[2]
            var key = id1+"_"+id2
            var lineData = overlap[key]
            drawLine(lineData,colors[colorIndex],i,id1,id2,percentDifference,offset)
        }
        colorIndex+=1
    }
    var legend = d3.select("#streetview").append("svg").attr("width",400).attr("height",categories.length*20+20)
    
    legend.selectAll(".legend rect")
    .data(categories)
    .enter()
    .append("rect")
    .attr("x",function(d){return 10})
    .attr("y",function(d,i){return i*20+10})
    .attr("width",10)
    .attr("height",10)
    .attr("fill",function(d){return d[1]})
    
    legend.selectAll(".legend")
    .data(categories)
    .enter()
    .append("text")
    .attr("x",function(d){return 30})
    .attr("y",function(d,i){return i*20+18})
    .text(function(d){return d[0]})
    .attr("fill",function(d){return d[1]})
    
}
function drawLine(data,color,category,id1,id2,percentDifference,offset){
   // console.log(data)
	var projection = d3.geo.equirectangular().scale(global.scale).center(global.center)
	var path = d3.geo.path().projection(projection);
    var lineWidthScale = d3.scale.linear().domain([0,80]).range([1,3])
    
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
    var line = d3.svg.line()
        .x(function(d){return projection([d[0],d[1]])[0]+offset*lineWidthScale(percentDifference)/2})
        .y(function(d){return projection([d[0],d[1]])[1]-offset})
    
	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
    
    var map = d3.select("#map svg").append("g")
    map.call(tip);
    map.selectAll(".boundary")
		.data(data.coordinates)
        .enter()
        .append("path")
		.attr("class","map-item")
		.attr("d",line)
		.style("stroke",color)
        .style("stroke-width",function(){return lineWidthScale(percentDifference)})
        .style("fill","none")
	    .style("opacity",.5)
        .attr("stroke-linecap","round")
	    .call(zoom)
    	.on("mouseover",function(){
    		tipText = [id1,id2,category,percentDifference]
    		tip.html(function(d){return tipText})
    		tip.show()
    	})
    	.on("mouseout",function(d){
    		tip.hide()
    	})
       // .on("mouseover",function(){console.log([id1,id2,category,percentDifference])});
}
function drawBlockGroups(data){
   // console.log(data)
	var projection = d3.geo.equirectangular().scale(global.scale).center(global.center)
	var path = d3.geo.path().projection(projection);
    
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
        
    var map = d3.select("#map svg").append("g")
    map.selectAll(".boundary")
		.data(data.features)
        .enter()
        .append("path")
		.attr("class","map-item")
		.attr("d",path)
		.style("stroke","#888")
        .style("stroke-width",.2)
        .style("fill","#fff")
	    .style("opacity",1)
	    .call(zoom);
        
}
function zoomed() {
	//console.log("calling zoomed" + d3.event.scale + ", translate: "+ d3.event.translate )
	map=d3.selectAll(".map-item").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  	map.select(".map-item").style("stroke-width", 1.5 / d3.event.scale + "px");
	var newScaleDistance = Math.round((5/d3.event.scale)* 100) / 100
	//d3.select("#scale .scale-text").text(newScaleDistance+"km")
	window.location.hash = JSON.stringify([d3.event.translate, d3.event.scale])
}

var table = {
	group: function(rows, fields) {
		var view = {}
		var pointer = null

		for(var i in rows) {
			var row = rows[i]

			pointer = view
			for(var j = 0; j < fields.length; j++) {
				var field = fields[j]

				if(!pointer[row[field]]) {
					if(j == fields.length - 1) {
						pointer[row[field]] = []
					} else {
						pointer[row[field]] = {}
					}
				}

				pointer = pointer[row[field]]
			}

			pointer.push(row)
		}

		return view
	},

	maxCount: function(view) {
		var largestName = null
		var largestCount = null

		for(var i in view) {
			var list = view[i]

			if(!largestName) {
				largestName = i
				largestCount = list.length
			} else {
				if(list.length > largestCount) {
					largestName = i
					largestCount = list.length
				}
			}
		}

		return {
			name: largestName,
			count: largestCount
		}
	},

	filter: function(view, callback) {
		var data = []

		for(var i in view) {
			var list = view[i]
			if(callback(list, i)) {
				data = data.concat(list)
			}
		}

		return data
	}
}