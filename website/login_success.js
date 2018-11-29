var tuples = {[['tpty', 'hyd']]:[['12733','narayanadri'],['10000','padmavati'],['20000','venkatadri']],
			  [['hyd', 'tpty']]:[['12734','narayanadri'],['10001','padmavati'],['20001','venkatadri']]
			};

function set_trains() {
	var ele = document.getElementById('train_list');
	ele.innerHTML="";
	from_place = document.getElementById('from_place').value;
	to_place = document.getElementById('to_place').value;
	var trains = tuples[[from_place,to_place]];
	for(var i=0;i<trains.length;i++)
	{
		var new_train = document.createElement('option');
		new_train.innerHTML = trains[i];
		ele.options.add(new_train);
	}
}