// Define the Web Data Connector
(function() {
  var myConnector = tableau.makeConnector();

  // Define the schema for the data
  myConnector.getSchema = function(schemaCallback) {
    var cols = [
      { id: "seriesID", alias: "Series ID", dataType: tableau.dataTypeEnum.string },
      { id: "year", alias: "Year", dataType: tableau.dataTypeEnum.int },
      { id: "period", alias: "Period", dataType: tableau.dataTypeEnum.string },
      { id: "value", alias: "Value", dataType: tableau.dataTypeEnum.float },
      { id: "footnotes", alias: "Footnotes", dataType: tableau.dataTypeEnum.string }
    ];

    var tableSchema = {
      id: "blsData",
      alias: "Bureau of Labor Statistics Data",
      columns: cols
    };

    schemaCallback([tableSchema]);
  };

  // Define the connector logic
  myConnector.getData = function(table, doneCallback) {
    var apiUrl = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

    // Prompt the user for input
    tableau.connectionData = JSON.stringify({
      seriesID: tableau.prompt("Enter the series ID(s) (comma-separated):").split(","),
      startYear: tableau.prompt("Enter the start year:"),
      endYear: tableau.prompt("Enter the end year:")
    });

    // Make the API request
    $.ajax({
      url: apiUrl,
      type: "POST",
      data: tableau.connectionData,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Content-type", "application/json");
      },
      success: function(data) {
        var tableData = [];

        // Parse the response data and add to the table
        $.each(data.Results.series, function(i, series) {
          var seriesID = series.seriesID;
          $.each(series.data, function(j, data) {
            var year = data.year,
              period = data.period,
              value = data.value,
              footnotes = data.footnotes[0] ? data.footnotes[0].text : "";
            if (period.startsWith("M")) {
              tableData.push({
                seriesID: seriesID,
                year: year,
                period: period,
                value: value,
                footnotes: footnotes
              });
            }
          });
        });

        // Add the data to the table and finish
        table.appendRows(tableData);
        doneCallback();
      },
      error: function(xhr, ajaxOptions, thrownError) {
        tableau.log(xhr.responseText);
        doneCallback();
      }
    });
  };

  // Register the connector with Tableau
  tableau.registerConnector(myConnector);
})();
