var request = require("request");


var data = [
  -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1,
];


function now_x(min, before_hours) {

  Date.prototype.addMinutes = function (h) {
    this.setTime(this.getTime() + (h * 60 * 1000));
    return this;
  };

  return new Date().addMinutes((8 - before_hours) * 60 + min).toISOString().replace(/\..+/, '') + '+08:00';

}

function callback() {

  /*** Cheack if all data received ***/
  for(var i = 0; i < 24; i++) {

    if(data[i] == -1)
      return;

  }


  /*** Average ***/
  var aver = 0;

  for(var i = 0; i < 24; i++)
    aver += data[i];

  aver /= 24;


  /*** Sd ***/
  var sd = 0;

  for(var i = 0; i < 24; i++)
    sd += (data[i] - aver) * (data[i] - aver);

  sd = Math.sqrt(sd / 23);


  /*** Stats ***/
  var stats = {
    'FREE': 0,
    'NORMAL': 0,
    'BUSY': 0
  };

  for(var i = 0; i < 24; i++) {

    if(aver - sd > data[i]) {

      stats['FREE']++;

    } else if(aver + sd < data[i]) {

      stats['BUSY']++;

    } else {

      stats['NORMAL']++;

    }

  }

  /*** Logs ***/
  console.log('Aver ' + aver);
  console.log('Sd ' + sd);

  if(aver - sd > data[0]) {

    console.log('FREE');

  } else if(aver + sd < data[0]) {

    console.log('BUSY');

  } else {

    console.log('NORMAL');

  }

  console.log(stats);

}

function get_req(counter) {

  var before_hours = counter;

  var now = now_x(0, before_hours);

  var now_05 = now_x(30, before_hours);
  var now_2 = now_x(120, before_hours);

  var now_05b = now_x(-30, before_hours);
  var now_2b = now_x(-120, before_hours);


  var dep_num = 0;
  var dep_query = '/api/v0/schedule/records?limit=1000000&scheduledDatetimeLocalMin=' + now_05 +
    '&scheduledDatetimeLocalMax=' + now_2 + '&arrivalDeparture=D';

  var arr_num = 0;
  var arr_query = '/api/v0/schedule/records?limit=1000000&scheduledDatetimeLocalMin=' + now_2b +
    '&scheduledDatetimeLocalMax=' + now_05b + '&arrivalDeparture=A';


  request.get({
    url: 'http://52.88.167.56' + dep_query,
    json: true
  }, function (request_dep, response_dep, data_dep) {

    if (data_dep.success) {

      dep_num = data_dep.recordCount || data_arr.data.length;

      request.get({
        url: 'http://52.88.167.56' + arr_query,
        json: true
      }, function (request_arr, response_arr, data_arr) {

        if (data_arr.success) {

          arr_num = data_arr.recordCount || data_arr.data.length;

        }

        var total = dep_num + arr_num;

        data[before_hours] = total;

        callback();

      });

    }

  });

}


for(var counter = 0; counter < 24; counter++) {

  get_req(counter);

}
