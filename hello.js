(function() {
  var myConnector = tableau.makeConnector();

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

  myConnector.getData = function(table, doneCallback) {
    var connectionData = JSON.parse(tableau.connectionData),
        seriesID = connectionData.seriesID,
        startYear = connectionData.startYear,
        endYear = connectionData.endYear,
        apiUrl = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

    var dataRequest = {
      "seriesid": seriesID,
      "startyear": startYear,
      "endyear": endYear,
      "registrationkey": "c8c85d09ef3b4435ae40270b1efeeb55"
    };

    $.ajax({
      url: apiUrl,
      type: "POST",
      data: JSON.stringify(dataRequest),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        var tableData = [];

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

        table.appendRows(tableData);
        doneCallback();
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log(xhr.responseText);
        doneCallback();
      }
    });
  };

  tableau.registerConnector(myConnector);
})();
