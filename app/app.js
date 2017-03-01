var socket = io();


function xyBriToRgb(x, y, bri){
            z = 1.0 - x - y;
            Y = bri / 255.0; // Brightness of lamp
            X = (Y / y) * x;
            Z = (Y / y) * z;
            r = X * 1.612 - Y * 0.203 - Z * 0.302;
            g = -X * 0.509 + Y * 1.412 + Z * 0.066;
            b = X * 0.026 - Y * 0.072 + Z * 0.962;
            r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
            g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
            b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
            maxValue = Math.max(r,g,b);
            r /= maxValue;
            g /= maxValue;
            b /= maxValue;
            r = r * 255;   if (r < 0) { r = 255 };
            g = g * 255;   if (g < 0) { g = 255 };
            b = b * 255;   if (b < 0) { b = 255 };
            return {
                r :r,
                g :g,
                b :b
            }
        }

function lights(){

		socket.emit('getAllLights');
		
		socket.on('getAllLights-feedback', function(msg){
						
			var lightArray = msg.lights;
			$('.allLights').html(null);

			for(var i in lightArray){
				
				var state = (lightArray[i].state.on == false ? '<span class="text-danger">off</span>':'<span class="text-success">on</span>');
				var buttonState = (lightArray[i].state.on == true ? '<span class="text-danger">off</span>':'<span class="text-success">on</span>');				
				
				
//GET CLOSEST COLOUR OF HUE LIGHT POSSIBLE -- START	
			var backGround;
				if(lightArray[i].state.on === false){
					backGround = 'rgba(185, 183, 183, 0.21)';
				} else {
					var bri = lightArray[i].state.bri;
					if(lightArray[i].state.xy){
						var x = lightArray[i].state.xy[0];
						var y = lightArray[i].state.xy[1];			
						var newRgb = xyBriToRgb(x, y, bri);
						backGround = 'rgba('+newRgb.r.toFixed(0)+', '+newRgb.g.toFixed(0)+', '+newRgb.b.toFixed(0)+', 1)';
					} else {
						var newRgb = xyBriToRgb(0.5003, 0.4493, bri);
						backGround = 'rgba('+newRgb.r.toFixed(0)+', '+newRgb.g.toFixed(0)+', '+newRgb.b.toFixed(0)+', 1)';
					}
				}
//GET CLOSEST COLOUR OF HUE LIGHT POSSIBLE 	-- END				
				
				var lightBox = '<div class="light-box-col col-sm-4 col-md-3">\
									<div class="light-box" style="background-color: '+backGround+'">\
										<h5>'+lightArray[i].name+'</h5>\
										<button data-light="'+i+'" class="lightToggle btn btn-default">Turn '+buttonState.toUpperCase()+'</button>\
									</div>\
								</div>';
				
				
				
				$('.allLights').append(lightBox);
							
				
			}
				$(".lightToggle").click(function(){
					var clickedLight = $(this).attr('data-light');
					
					if(lightArray[clickedLight].state.on == false){
						//light off
						socket.emit('changeLightState', {state: true, light_id: clickedLight});
						changing(clickedLight);
					} else {
						//light on
						socket.emit('changeLightState', {state: false, light_id: clickedLight});
						changing(clickedLight);
					}
					
					
				});
						
		});
			
}

function changing(light_id){
	$('[data-light='+light_id+']').parent('div').addClass('changing');
}


$(".toggleAll").click(function(){
	var allLightsState = $(this).attr('data-toggle');
	socket.emit('toggleAllLights', {state: allLightsState});
});

socket.on('update-lights', function(){
	lights();
});

/*
window.setInterval(function(){
	lights();
}, 10000);
*/
lights();