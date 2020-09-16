// Grab the width of the containing box
var width = parseInt(d3.select("#scatter").style("width"));

// Designate the height of the graph
var height = width - width / 3.9;

// Margin spacing for graph
var margin = 20;

// Space for placing words
var labelArea = 110;

// Padding for the text at the bottom and left axes
var tPadBot = 40;
var tPadLeft = 40;

// Create the actual canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Set the radius for each for that will appear in the graph. 
var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

// Labels for the Axes
// A) Bottom Axis
// We create a group element to nest our bottom axes labels.
svg.append("g").attr("class", "xText");
// xText will allows us to select the group without excess code.
var xText = d3.select(".xText");

// Give xText a transform property that places it at the bottom of the chart. 
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes. 
function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin -tPadBot) +
      ")"
  );
}
xTextRefresh();

// Use xText to append three text SVG files, with y coordinates specified to space out the values.
// 1. Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// 2. Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
// 3. Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// B) Left Axis

// Specifying the variables like this allows us to make our transform attributes more readable. 
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Append a second label group, this time for the axis left of the chart.
svg.append("g").attr("class", "yText");

// yText will allow us to select the text without excess code.
var yText = d3.select(".yText");

// Like before, nest the group's transform attr in a function
// to make changing it on window change an easy operation.
function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// Now we append the text.
// 1. Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// 2. Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// 3. Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// 2. Import csv file
// This data file includes state-by-state demographic data from the US Census
// and measurements from health risks obtained
// By the Behavioral Risk Factor Surveillance System.

// Import csv data with d3's .csv import method.
d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

// 3. Create visualization function
function visualize(theData) {
    // Part 1: Essential Local Variables and Functions
    // curX and curY will determine what data gets represented in each axis.
    // We designate our defaults here, which carry the same names
    // as the headings in their matching .csv data file.
    var curX = "poverty";
    var curY = "obesity";

    // We also save empty variables for min and max values of x and y.
    // this will allow us to alter the values in functions and remove repetitious code.
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // This function allows us to set up tooltip rules.
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
          // x key
          var theX;
          // Grab the state name.
          var theState = "<div>" + d.state + "</div>";
          // Get the y value's key and value.
          var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
          // If the x key is poverty
          if (curX === "poverty") {
            // Get the x key and a version of the value formatted to show percentage
            theX = "<div>" + curX + ": " + d[curX] + "%</div>";
          }
          else {
              // Otherwise
              // Grab the x key and a version of the value formatted to include commas after every third digit.
              theX = "<div>" +
                curX +
                ": " +
                parseFloat(d[curX]).toLocaleString("en") +
                "</div>";
          }
          // Display what was captured.
          return theState + theX + theY;
      });
      // Call the toolTip function.
      svg.call(toolTip);

      // Part 2: 
      // a. change the min and max for x
      function xMinMax() {
        // min will grab the smallest datum from the selected column. 
        xMin = d3.min(theData, function(d) {
          return parseFloat(d[curX]) * 0.90;
        });

        // .max will grab the largest datum from the selected column.
        xMax = d3.max(theData, function(d) {
          return parseFloat(d[curX]) * 1.10;
        });
      }

      // b. change the min and max for y
      function yMinMax() {
        // min will grab the smallest datum from the selected column.
        yMin = d3.min(theData, function(d) {
          return parseFloat(d[curY] * 0.90)
        });

        // .max will grab the largest daturm from the selected column.
        yMax = d3.max(theData, function(d) {
          return parseFloat(d[curY]) * 1.10;
        });
      }

      // c. change the classes (and appearance) of label text when clicked. 
      function labelChange(axis, clickedText) {
        // Switch the currently active to inactive.
        d3
          .selectAll(".aText")
          .filter("." + axis)
          .filter(".active")
          .classed("active", false)
          .classed("inactive", true);
        
          // Switch the text just clicked to active.
          clickedText.classed("inactive", false).classed("active", true);
      }

      // Part 3: Instantiate the Scatter Plot
      // This will add the first placement of our data and axes to the scatter plot.

      // First grab the min and max values of x and y.
      xMinMax();
      yMinMax();

      // With the min and max values now defined, the scales can be created.
      var xScale = d3
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
      var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        // Height is inverse due to how d3 calc's y-axis placement
        .range([height - margin - labelArea, margin]);

      // Pass the scales into the axis methods to create the axes.
      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      // Determine x and y tick counts
      function tickCount() {
        if (width <= 500) {
          xAxis.ticks(5);
          yAxis.ticks(5);
        }
        else {
          xAxis.ticks(10);
          yAxis.ticks(10);
        }
      }
      tickCount();

      // Append the aces in group elements. By calling them, we include all of the numbers, borders
      // and ticks. The transform attribute specifies where to place the axes.
      svg
        .append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
      svg
        .append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin + labelArea) + ", 0)");
      // Now make a grouping for dots and their labels.
      var theCircles = svg.selectAll("g theCircles").data(theData).enter();

      // We append the circles for each row of data (or each state, in this case).
      theCircles
        .append("circle")
        // These attr's specify location, size and class.
        .attr("cx", function(d) {
          return xScale(d[curX]);
        })
        .attr("cy", function(d) {
          return yScale(d[curY]);
        })
        .attr("r", circRadius)
        .attr("class", function(d) {
          return "stateCircle " + d.abbr;
        })
        // Hover rules
        .on("mouseover", function(d) {
          // Show the tooltip
          toolTip.show(d, this);
          // Highlight the state circle's border
          d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
          // Remove the tooltip
          toolTip.hide(d);
          // Remove highlight
          d3.select(this).style("stroke", "#e3e3e3");
        });
      
      // With the circles on the graph, we need matching labels.
      theCircles
        .append("text")
        // We return the abbreviation to .text, which makes the text the abbreviation.
        .text(function(d) {
          return d.abbr;
        })
        // Now place the text using our scale.
        .attr("dx", function(d) {
          return xScale(d[curX]);
        })
        .attr("dy", function(d) {
          // When the size of the text is the radius, adding a third of the radius to the
          // height pushes it into the middle of the circle.
          return yScale(d[curY]) + circRadius / 2.5;
        })
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        // Hover Rules
        .on("mouseover", function(d) {
          // Show the tooltip
          toolTip.show(d);
          // Hightlight the state circle's border
          d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
          // Remove tooltup
          toolTip.hide(d);
          // Remove highlight
          d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });

        // Part 4: Make the Graph Dynamic
        // ================
        // This section will allow the user to click on any label
        // and display the data it references.

        // Select all axis text and add this d3 click event.
        d3.selectAll(".atext").on("click", function() {
          // Make sure we save a selection of the click text,
          // so we can reference it without typing out the invoker each time.
          var self = d3.select(this);

          // We only want to run this on inactive labels. It's a waste of the 
          // processor to execute the function if the data is already
          // displayed on the graph.
          if (self.classed("inactive")) {
            // Grab the name and axis save in label.
            var axis = self.attr("data-axis");
            var name = self.attr("data-name");

            // When x is the saved axis, execute this:
            if (axis === "x") {
              // Make the curX the same as the data name.
              curX = name;

              // Change the min and max of the x-axis
              xMinMax();

              // Update the domain of x.
              xScale.domain([xMin, xMax]);

              // Now use a transition when we update the xAxis.
              svg.select(".xAxis").transition().duration(300).call(xAxis);

              // With the axis changed, let's update the location of the state circles.
              d3.selectAll("circle").each(function() {
                // Each state circle gets a transition for it's new attribute.
                // This will lend the circle a motion tween
                // from it's original psot to the new location.
                d3
                  .select(this)
                  .transition()
                  .attr("cx", function(d) {
                    return xScale(d[curX]);
                  })
                  .duration(300);
              });

              // We need to change the location of the state texts, too.
              d3.selectAll(".stateText").each(function() {
                // We give each state text the same motion tween as the matching circle.
                d3
                  .select(this)
                  .transition()
                  .attr("dx", function(d) {
                    return xScale(d[curX]);
                  })
                  .duration(300);
              });

              // Finally, change the classes of the last active label and the clicked label.
              labelChange(axis, self);
            }
            else {
              // When y is the saved axis, execute this:
              // Make curY the same as the data name.
              curY = name;

              // Change the min and max of the y-axis.
              yMinMax();

              // Update the domain of y.
              yScale.domain([yMin, yMax]);

              // Update Y Axis
              svg.select(".yAxis").transition().duration(300).call(yAxis);

              // with the axis changed, let's update the location of the state circles.
              d3.selectAll("circle").each(function() {
                // Each state circle gets a transition for it's new attribute.
                // This will lend the circle a motion tween
                // from it's original spot to the new location.
                d3
                  .select(this)
                  .transition()
                  .attr("cy", function(d) {
                    return yScale(d[curY]);
                  })
                  .duration(300);
                });

                // We need to change the location of the state texts, too.
                d3.selectAll(".stateText").each(function() {
                  // We give each state text the same motion tween as the matching circle.
                  d3
                    .select(this)
                    .transition()
                    .attr("dy", function(d) {
                      return yScale(d[curY]) + circRadius / 3;
                    })
                    .duration(300);
                });

                // Finally, change the classes of the last active label and the clicked label.
                labelChange(axis, self);
            }
          }
        });

        // Part 5: Mobile Responsive
        // ==========================
        // With d3, we can call a resize function whenever the window dimensions change.
        // This make's it possible to add true mobile-responsiveness to our charts.
        d3.select(window).on("resize", resize);

        // We need to specify which parts of the chart need size and position changes.
        function resize() {
          // Redefine the width, height and leftTextY (the three variables dependent on the width of the window).
          width = parseInt(d3.select("#scatter").style("width"));
          height = width - width / 3.9;
          leftTextY = (height + labelArea) / 2 - labelArea;

          // Apply the width and height to the svg canvas. 
          svg.attr("width", width).attr("height", height);

          // Change the xScale and yScale ranges
          xScale.range([margin + labelArea, width - margin]);
          yScale.range([height - margin - labelArea, margin]);

          // With the scales changes, update the axes (and the height of the x-axis)
          svg
            .select(".xAxis")
            .call(xAxis)
            .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
        
          svg.select(".yAxis").call(yAxis);

          // Update the ticks on each axis.
          tickCount();

          // Update the labels.
          xTextRefresh();
          yTextRefresh();

          // Update the radius of each dot. 
          crGet();

          // With the axis changed, let's update the location and radius of the state circles. 
          d3
            .selectAll("circle")
            .attr("cy", function(d) {
              return yScale(d[curY]);
            })
            .attr("cx", function(d) {
              return xScale(d[curX]);
            })
            .attr("r", function() {
              return circRadius;
            });

          // We need to change the location and size of the state texts, too.
          d3
            .selectAll(".stateText")
            .attr("dy", function(d) {
              return yScale(d[curY]) + circRadius / 3;
            })
            .attr("dx", function(d) {
              return xScale(d[curX]);
            })
            .attr("r", circRadius / 3);
        }
}