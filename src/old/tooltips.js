$(function () {
  
  $('.bubbleLink').each(function () {
    // options
    var distance = 10;
    var time = 100;
    var hideDelay = 100;

    var hideDelayTimer = null;

    // tracker
    var beingShown = false;
    var shown = false;
    
    var trigger = $('.trigger', this);
    var popup = $('.popup', this).css('opacity', 0);
	var resources = $('.popup .additional', this);
	var existing = $('.popup .existing', this);
	
	var graph = $("#graph", window.parent.document).val();
	var lan = $("#lan", window.parent.document).val();

    // set the mouseover and mouseout on both element
    $([trigger.get(0), popup.get(0)]).mouseover(function (e) {
	  var phrase = popup.parent().find('.trigger').text();
      // stops the hide event if we move from the trigger to the popup element
      if (hideDelayTimer) clearTimeout(hideDelayTimer);
	  // console.clear();
      // don't trigger the animation again if we're being shown, or already visible
      if (beingShown || shown) {
        return;
      } else {
        beingShown = true;
		
		// append SPARQL result only if not already there
		resources.html('');
		existing.html('');
	    $('#widget ul li a.source').each(function(index, value) {
			  
			  entry = '<div class="resource ' + $(this).parent().attr('id') + '"><span class="label">' + $(this).text() + ': </span>';
			  entry += '<a href="#" class="dbplink"><div id="throbber"><img src="/rozeta/img/ajax-loader.gif" /></div></a>';
			  entry += '<ul class="retrieved"></ul></div>';
			  
			  resources.append(entry);
			  var endpoint = $(this).attr('href');			  
			  var id = $(this).parent().attr('id');
			  var operator = '?';
			  if(endpoint.indexOf('?') != -1)
				operator = '&';
			  
			  // Get recommendations
			  var query = endpoint + operator + 'query=SELECT%20%3Fentity%20WHERE%7B%20%7B%3Fentity%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label%3E%20%22' + phrase + '%22%40' + lan + '.%7D%20UNION%7B%3Fentity%20%3Chttp%3A%2F%2Fwww.w3.org%2F2004%2F02%2Fskos%2Fcore%23prefLabel%3E%20%22' + phrase + '%22%40' + lan + '.%7D%20UNION%7B%3Fentity%20%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2Ftitle%3E%20%22' + phrase + '%22%40' + lan + '.%7D%20UNION%7B%3Fentity%20%3Chttp%3A%2F%2Fpersistence.uni-leipzig.org%2Fnlp2rdf%2Fontologies%2Fnif-core%23anchorOf%3E%20%22' + phrase + '%22%40' + lan + '.%7D%7D%20LIMIT%2010&format=application%2Fsparql-results%2Bjson';
			 //console.log(query);
			  $.getJSON(query, function(data) {
				  var result = 'No matches';
				  resources.find('.' + id + ' .link_widget').remove();
				  if(data.results.bindings.length){
					var empty = '';
					if(data.results.bindings.length == 1) empty = '-empty';
					
					$(data.results.bindings).each(function(key, val){
						
						result = val.entity.value;						
						if(key == 0) {					
							resources.find('.' + id + ' .dbplink').text(result);
							var links = '<span class="link_widget"><a href="/rozeta/linkto.php?linktype=exactMatch&graph=' + encodeURIComponent(graph) + '&phrase=' + encodeURIComponent(phrase) + '&uri=' + encodeURIComponent(result) + '" target="_parent"><img src="/rozeta/img/mini_link.gif" title="Link as skos:exactMatch" /></a>';
							links += '<a href="/rozeta/linkto.php?linktype=relatedMatch&graph=' + encodeURIComponent(graph) + '&phrase=' + encodeURIComponent(phrase) + '&uri=' + encodeURIComponent(result) + '" target="_parent"><img src="/rozeta/img/mini_link_related.gif" title="Link as skos:relatedMatch" /></a>'; 
							links += '<a href="#" class="reload' + empty + '"><img src="/rozeta/img/reload' + empty + '.png" title="Recommend another" /></a><br /></span>'; 
							resources.find('.' + id + ' .label').after(links);
							
							resources.find('.' + id + ' .dbplink').attr('href', 'javascript:Shadowbox.open({content:\''+ result + '\', player:\'iframe\', width: 940});');
							resources.find('.' + id + ' .dbplink').attr('target', '_blank');
						}
						else{
						    var link = '<li>' + result + '</li>';
							resources.find('.' + id + ' .retrieved').append(link);
						}
					});
				  }
				  else{
				    resources.find('.' + id + ' .dbplink').text(result);
				  }					
			  }); 			  
		});
		
		// get existing links
		var queryExisting = 'http://fraunhofer2.imp.bg.ac.rs/sparql?query=SELECT%20DISTINCT%20%3Fs%20%3Fp%20%3Fo%20FROM%20%3C' + graph + '%3E%20WHERE%20%7B%0A%3Fs%20%3Fp%20%3Fo.%0A%3Fs%20%3Chttp%3A%2F%2Fpersistence.uni-leipzig.org%2Fnlp2rdf%2Fontologies%2Fnif-core%23anchorOf%3E%20%22' + phrase + '%22%5E%5E%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23string%3E.%0AMINUS%20%7B%3Fs%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23type%3E%20%3Fo.%7D%0AFILTER%20(isUri(%3Fo))%7D&format=application%2Fsparql-results%2Bjson';

		$.getJSON(queryExisting, function(data) {
		  var result = 'No existing links';
		  console.log("Querying...");
		  if(data.results.bindings != ""){
			resources.find("#throbber").hide();
			existing.css('display', 'block');
			var empty = '';
			if(data.results.bindings.length == 1) empty = '-empty';

			$(data.results.bindings).each(function(key, val){	
				var property = '';
				var link = '';
				console.log("ADDING: " + val.o.value);
				property = val.p.value.split('#');
				if(property[1] == null) {
					property[1] = val.p.value.substring(val.p.value.lastIndexOf('/') + 1, val.p.value.length);
				}					
						
				link = '<span class="label">' + property[1] + ':</span><br /><a href="javascript:Shadowbox.open({content:\''+ val.o.value + '\', player:\'iframe\', width: 940});">' + val.o.value + '</a><br /><br />';
				existing.append(link);
			});
		  }
		  else{
			existing.css('display', 'none');
		  }					
		});
		
		//make sure don't exceed the boundaires
		var left = -80;
		var top = 15;
		var right = $('body').width() + 40;
		
		if(e.pageX < 380){
			left = 0;
		}	
		
		if(e.pageX > right-320){
			left = right - e.pageX - 330;
		}
		
		if(e.pageY > 500){
			top = -100;
		}
		// }	
		
		// if(e.pageX > "){
			// left = right - e.pageX - 330;
		// }
		
        // reset position of popup box
        popup.css({
          top: top,
          left: left,
          display: 'block' // brings the popup back in to view
        })

        // (we're using chaining on the popup) now animate it's opacity and position
        .animate({
          opacity: 1
        }, time, 'swing', function() {
          // once the animation is complete, set the tracker variables
          beingShown = false;
          shown = true;
        });
      }
    }).mouseout(function () {
      // reset the timer if we get fired again - avoids double animations
      if (hideDelayTimer) clearTimeout(hideDelayTimer);
      
      // store the timer so that it can be cleared in the mouseover if required
      hideDelayTimer = setTimeout(function () {
        hideDelayTimer = null;
        popup.animate({
          opacity: 0
        }, time, 'swing', function () {
          // once the animate is complete, set the tracker variables
          shown = false;
          // hide the popup entirely after the effect (opacity alone doesn't do the job)
          popup.css('display', 'none');
        });
      }, hideDelay);
    });
  });
  
  // using a delegated .on("click") event to attach the event handler AFTER injecting new HTML (i.e. retrieving a resource)
  $('.bubbleLink .popup').on("click", "a.reload", function () {
	var current = $(this).parent().parent().find('.dbplink').text();
	var next = $(this).parent().parent().find('.retrieved li:first').text();
	
	$(this).parent().parent().find('.dbplink').fadeOut(300);
	$(this).parent().parent().find('.retrieved li:first').remove();
	$(this).parent().parent().find('.retrieved').append('<li>' + current + '</li>');
	$(this).parent().parent().find('.dbplink').text(next);
	$(this).parent().parent().find('.dbplink').attr("href", "javascript:Shadowbox.open({content:'" + next + "', player:'iframe', width: 940});");
	$(this).parent().parent().find('.dbplink').fadeIn(300);
  });
});