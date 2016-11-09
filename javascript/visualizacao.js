$( function() {
  $( "#inicio" ).datepicker();
} );

$(function(){
    var $select = $("#lojas");
    for (i=1;i<=45;i++){
        $select.append($('<option></option>').val(i).html(i))
    }
});

// ** Update data section (Called from the onclick)
function updateData() {
  d3.selectAll("svg > *").remove();
  var svg = d3.select("svg"),
  width = svg.attr("width");

  var format = d3.format(",d");

  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  var pack = d3.pack()
      .size([width, width])
      .padding(1.5);
  var data_inicio_formatada = $.datepicker.formatDate('yy-mm-dd', $('#inicio').datepicker('getDate'));
  console.log(data_inicio_formatada);

  d3.csv("data/flare.csv", function(d) {
    d.Weekly_Sales = +d.Weekly_Sales;
    var lojas = document.getElementById("lojas");
    if (d.Date == data_inicio_formatada && d.Store == lojas.options[lojas.selectedIndex].value) return d;
  }, function(error, classes) {
    if (error) throw error;

    var root = d3.hierarchy({children: classes})
        .sum(function(d) { return d.Weekly_Sales; })
        .each(function(d) {
          if (id = d.data.Store) {
            var id, i = id.lastIndexOf(".");
            d.id = id;
            d.dept = d.data.Dept;
            d.Weekly_Sales = d.data.Weekly_Sales;
            d.package = id.slice(0, i);
            d.class = d.data.Dept;
          }
        });

    var node = svg.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    var dept = $("#dept").val();
      node.append("circle")
          .attr("id", function(d) { return d.id; })
          .attr("r", function(d) { return d.r; })
          .style("fill", function(d) {
            if(dept == d.dept)
              return d3.rgb("#006621");
            else
              return color(d.package);
          });

    node.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.id; })
      .append("use")
        .attr("xlink:href", function(d) { return "#" + d.id; });

    node.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
      .selectAll("tspan")
      .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
        .text(function(d) { return d; });

    node.append("title")
        .text(function(d) { return "Loja " + d.id + " - Departamento " + d.class + "\n" + "Vendas na semana: " + format(d.Weekly_Sales); });
  });
}
