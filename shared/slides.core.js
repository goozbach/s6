   var snum = 1;      /* current slide # (non-zero based index e.g. starting with 1) */
   var smax = 1;      /* max number of slides */
	 var incpos = 0;    /* current step in slide */ 
   var s6mode = true; /* are we in slide mode (in contrast to outline mode)? */ 
   var defaultView = 'slideshow'; /* slideshow | outline */
   

 function debug( msg )	 
 {
	 /* uncomment to enable debug messages in console such as Firebug */
	 /* console.log( '[debug] ' + msg ); */
 }	
	 
 function showHide(action)
 {
	switch( action ) {
	  case 's': $( '#navLinks' ).css( 'visibility', 'visible' );  break;
	  case 'h': $( '#navLinks' ).css( 'visibility', 'hidden' );   break;
    case 'c':  /* toggle control panel */
      if( $( '#navLinks' ).css( 'visibility' ) != 'visible' )
         $( '#navLinks' ).css( 'visibility', 'visible' );
      else
         $( '#navLinks' ).css( 'visibility', 'hidden' );
	    break; 
  }
 }  
   
  function updateCurrentSlideCounter() {
	 
    $( '#currentSlide' ).html( '<a id="plink" href="">' + 
		     '<span id="csHere">' + snum + '<\/span> ' + 
		     '<span id="csSep">\/<\/span> ' + 
		     '<span id="csTotal">' + smax + '<\/span>' +
		     '<\/a>' );		
  }    
   

  function updatePermaLink() {
	   $('#plink').get(0).href = window.location.pathname + '#slide' + snum;
  }

 function goTo( target ) {
	 if( target > smax || target == snum ) return;
	 go( target - snum );
 }
 
 function go( dir ) {

	debug( 'go: ' + dir );
  
	if( dir == 0 ) return;  /* same slide; nothing to do */
	
	var cid = '#slide' + snum;   /* current slide (selector) id */
  var csteps = steps[snum-1];  /* current slide steps array */
															   
  /* remove all step and stepcurrent classes from current slide */
	if( csteps.length > 0) {
		$( csteps ).each( function() {
			$( this ).removeClass( 'step' ).removeClass( 'stepcurrent' );
		} );
	}

  /* set snum to next slide */
	snum += dir;
	if( snum > smax ) snum = smax;
	if (snum < 1) snum = 1;
  
	var nid = '#slide' + snum;  /* next slide (selector) id */
  var nsteps = steps[snum-1]; /* next slide steps array */															  
  
	if( dir < 0 ) /* go backwards? */
	{
		incpos = nsteps.length;
		/* mark last step as current step */
		if( nsteps.length > 0 ) 
			$( nsteps[incpos-1] ).addClass( 'stepcurrent' );		
	}
	else /* go forwards? */
	{
		incpos = 0;
	  if( nsteps.length > 0 ) {
		  $( nsteps ).each( function() {
				$(this).addClass( 'step' ).removeClass( 'stepcurrent' );
			} );
		}
	}	
	
  $( cid ).hide();
  $( nid ).show();
  
  $('#jumplist').get(0).selectedIndex = (snum-1);
  updateCurrentSlideCounter();
  updatePermaLink(); 
}

 function subgo( dir ) {
	
	debug( 'subgo: ' + dir + ', incpos before: ' + incpos + ', after: ' + (incpos+dir) );
	
	var csteps = steps[snum-1]; /* current slide steps array */
	
	if( dir > 0) {  /* go forward? */
		if( incpos > 0 ) $( csteps[incpos-1] ).removeClass( 'stepcurrent' );
		$( csteps[incpos] ).removeClass( 'step').addClass( 'stepcurrent' ); 
		incpos++;
	} else { /* go backwards? */
		incpos--;
		$( csteps[incpos] ).removeClass( 'stepcurrent' ).addClass( 'step' );
		if( incpos > 0 ) $( csteps[incpos-1] ).addClass( 'stepcurrent' );
	}
}

function noteLabel() { // Gives notes id's to match parent slides
	var notes = GetElementsWithClassName('div','notes');
	for (var i = 0; i < notes.length; i++) {
		var note = notes[i];
		var id = 'note' + note.parentNode.id.substring(5);
		note.setAttribute('id',id);
	}
	resetElapsedSlide();
	resetRemainingTime();
	window.setInterval('updateElaspedTime()', 1000);
}

function createNotesWindow() { // creates a window for our notes
	if (!s5NotesWindow || s5NotesWindow.closed) { // Create the window if it doesn't exist
		s5NotesWindowLoaded = false;
		// Note: Safari has a tendency to ignore window options preferring to default to the settings of the parent window, grr.
		s5NotesWindow = window.open('ui/s5-notes.html', 's5NotesWindow', 'top=0,left=0');
	}
	if (s5NotesWindowLoaded) { // Load the current note if the Note HTML has loaded
		loadNote();
	} else { // Keep trying...
		window.setTimeout('createNotesWindow()', 50);
	}
}

function loadNote() {
// Loads a note into the note window
	var notes = nextNotes = '<em class="disclaimer">There are no notes for this slide.</em>';
	if (document.getElementById('note' + snum)) {
		notes = document.getElementById('note' + snum).innerHTML;
	}
	if (document.getElementById('note' + (snum + 1))) {
		nextNotes = document.getElementById('note' + (snum + 1)).innerHTML;
	}
	
	var jl = document.getElementById('jumplist');
	var slideTitle = jl.options[jl.selectedIndex].text.replace(/^\d+\s+:\s+/, '') + ((jl.selectedIndex) ? ' (' + jl.selectedIndex + '/' + (smax - 1) + ')' : '');
	if (incrementals[snum].length > 0) {
//		alert('howdy');
		slideTitle += ' <small>[' + incpos + '/' + incrementals[snum].length + ']</small>';
	}
	if (jl.selectedIndex < smax - 1) {
		var nextTitle = jl.options[jl.selectedIndex + 1].text.replace(/^\d+\s+:\s+/, '') + ((jl.selectedIndex + 1) ? ' (' + (jl.selectedIndex + 1) + '/' + (smax - 1) + ')' : '');
	} else {
		var nextTitle = '[end of slide show]';
	}
	
	if (s5NotesWindow && !s5NotesWindow.closed && s5NotesWindow.document) {
		s5NotesWindow.document.getElementById('slide').innerHTML = slideTitle;
		s5NotesWindow.document.getElementById('notes').innerHTML = notes;
		s5NotesWindow.document.getElementById('next').innerHTML = nextTitle;
		s5NotesWindow.document.getElementById('nextnotes').innerHTML = nextNotes;
	}
	resetElapsedSlide();
}

function minimizeTimer(id) {
	var obj = s5NotesWindow.document.getElementById(id);
	if (hasClass(obj,'collapsed')) {
		removeClass(obj,'collapsed');
	} else {
		addClass(obj,'collapsed');
	}
}

function resetElapsedTime() {
	presentationStart = new Date();
	slideStart = new Date();
	updateElaspedTime();
}

function resetElapsedSlide() {
	if (snum != previousSlide) {
		slideStart = new Date();
		previousSlide = snum;
		updateElaspedTime();
	}
}

function updateElaspedTime() {
	if (!s5NotesWindowLoaded || !s5NotesWindow || s5NotesWindow.closed) return;
	var now = new Date();
	var ep = s5NotesWindow.document.getElementById('elapsed-presentation');
	var es = s5NotesWindow.document.getElementById('elapsed-slide');
	ep.innerHTML = formatTime(now.valueOf() - presentationStart.valueOf());
	es.innerHTML = formatTime(now.valueOf() - slideStart.valueOf());
}

function resetRemainingTime() {
	if (!s5NotesWindowLoaded || !s5NotesWindow || s5NotesWindow.closed) return;
	var startField = s5NotesWindow.document.getElementById('startFrom');
	startFrom = readTime(startField.value);
	countdown.remaining = startFrom * 60000;  // convert to msecs
	countdown.start = new Date().valueOf();
	countdown.end = countdown.start + countdown.remaining;
	var tl = s5NotesWindow.document.getElementById('timeLeft');
	var timeLeft = formatTime(countdown.remaining);
	tl.innerHTML = timeLeft;
}

function updateRemainingTime() {
	if (!s5NotesWindowLoaded || !s5NotesWindow || s5NotesWindow.closed) return;
	var tl = s5NotesWindow.document.getElementById('timeLeft');
	var now = new Date();
	if (countdown.state == 'run') {
		countdown.remaining = countdown.end - now;
	}
	tl.style.color = '';
	tl.style.backgroundColor = '';
	if (countdown.remaining >= 0) {
		var timeLeft = formatTime(countdown.remaining);
		removeClass(tl,'overtime');
		if (countdown.remaining < 300000) {
			tl.style.color = 'rgb(' + (255-Math.round(countdown.remaining/2000)) + ',0,0)';
			tl.style.backgroundColor = 'rgb(255,255,' + (Math.round(countdown.remaining/2000)) + ')';
		}
	} else {
		var timeLeft = '-' + formatTime(-countdown.remaining);
		addClass(tl,'overtime');
	}
	tl.innerHTML = timeLeft;
}

function toggleRemainingTime() {
	if (countdown.state == 'pause') countdown.state = 'run'; else countdown.state = 'pause';
	if (countdown.state == 'pause') {
		window.clearInterval(countdown.timer);
	}
	if (countdown.state == 'run') {
		countdown.start = new Date().valueOf();
		countdown.end = countdown.start + countdown.remaining;
		countdown.timer = window.setInterval('updateRemainingTime()', 1000);
	}
}

function alterRemainingTime(amt) {
	var change = amt * 60000;  // convert to msecs
	countdown.end += change;
	countdown.remaining += change;
	updateRemainingTime();
}

function formatTime(msecs)  {
	var time = new Date(msecs);
	
	var hrs = time.getUTCHours() + ((time.getUTCDate() -1) * 24); // I doubt anyone will spend more than 24 hours on a presentation or single slide but just in case...
	hrs = (hrs < 10) ? '0'+hrs : hrs;
	if (hrs == 'NaN' || isNaN(hrs)) hrs = '--';
	
	var min = time.getUTCMinutes();
	min = (min < 10) ? '0'+min : min;
	if (min == 'NaN' || isNaN(min)) min = '--';
	
	var sec = time.getUTCSeconds();
	sec = (sec < 10) ? '0'+sec : sec;
	if (sec == 'NaN' || isNaN(sec)) sec = '--';

	return hrs + ':' + min + ':' + sec;
}

function readTime(val) {
	var sregex = /:/;
	var matches = sregex.exec(val);
	if (matches == null) {
		return val;
	} else {
		var times = val.split(':');
		var hours = parseInt(times[0]);
		var mins = parseInt(times[1]);
		var total = (hours * 60) + mins;
		return total;
	}
}


function toggle() {
 
  /* get stylesheets */
	var slides  = $('#slideProj').get(0);
	var outline = $('#outlineStyle').get(0);
	
  if( !slides.disabled ) {
		slides.disabled = true;
		outline.disabled = false;
		s6mode = false;
    $('.slide').each( function() { $(this).show(); } );
	} else {
		slides.disabled = false;
		outline.disabled = true;
		s6mode = true;
    $('.slide').each( function(i) {
      if( i == (snum-1) )
        $(this).show();
      else
        $(this).hide();
    });
	}
}
 
 
   function populateJumpList() {
    
     var list = $('#jumplist').get(0);
    
     $( '.slide' ).each( function(i) {              
       list.options[list.length] = new Option( (i+1)+' : '+ $(this).find('h1').text(), (i+1) );
     });
   } 
   
   function createControls() {	  
  
   	 $('#controls').html(  '<div id="navLinks">' +
	'<a accesskey="n" id="show-notes" href="#" title="Show Notes">&equiv;<\/a>' +
	'<a accesskey="t" id="toggle" href="#">&#216;<\/a>' +
	'<a accesskey="z" id="prev" href="#">&laquo;<\/a>' +
	'<a accesskey="x" id="next" href="#">&raquo;<\/a>' +
	'<div id="navList"><select id="jumplist" /><\/div>' +
	'<\/div>' ); 
      
      $('#controls').mouseover( function() { showHide('s'); } );
      $('#controls').mouseout( function()  { showHide('h'); } );
      $('#show-notes').click( function() { createNotesWindow(); } );
      $('#toggle').click( function() { toggle(); } );
      $('#prev').click( function() { go(-1); } );
      $('#next').click( function() { go(1); } );
      
      $('#jumplist').change( function() { goTo( parseInt( $( '#jumplist' ).val() )); } );
  	
      populateJumpList();     
      updateCurrentSlideCounter();
   }
   
   function addSlideIds() {
     $( '.slide' ).each( function(i) {
       $(this).attr( 'id', 'slide'+(i+1) );
     });
       
     smax = $( '.slide' ).length;
   }
   
   function notOperaFix() {
	     
	     $('#slideProj').attr( 'media','screen' );
              
	     var outline = $('#outlineStyle').get(0);
	     outline.disabled = true;
    }    
     
  
  function defaultCheck() {
     $( 'meta' ).each( function() {
        if( $(this).attr( 'name' ) == 'defaultView' )
          defaultView = $(this).attr( 'content' );
     } );
  }
  
  function keys(key) {
	if (!key) {
		key = event;
		key.which = key.keyCode;
	}
	if (key.which == 84) {
		toggle();
		return;
	}
	if (s6mode) {
		switch (key.which) {
			case 32: // spacebar
			case 34: // page down
			case 39: // rightkey
			case 40: // downkey
				
				if (!steps[snum-1] || incpos >= steps[snum-1].length) {
					go(1);
				} else {
					subgo(1);
				}
				break;
			case 33: // page up
			case 37: // leftkey
			case 38: // upkey
					
					if( !steps[snum-1] || incpos <= 0 ) {
					  go(-1);
				  } else {
					  subgo(-1);
					}
				  break;
      case 36: // home
				goTo(1);
				break;
			case 35: // end
				goTo(smax);
				break;   
			case 67: // c
				showHide('c');
				break;
		}
	}
	return false;
}


function collectStepsWorker(obj) {
	
	var steps = new Array();
	if( !obj ) 
		return steps;
	
	$(obj).children().each( function() {
	  if( $(this).hasClass( 'step' ) ) {
			
			debug( 'step found for ' + this.tagName );
			$(this).removeClass( 'step' );

			/* don't add enclosing list; instead add step class to all list items/children */
			if( $(this).is( 'ol,ul' ) ) {
				debug( '  ol or ul found; adding auto steps' );
				$(this).children().addClass( 'step' );
			}
			else
			{
				steps.push( this )
			}
		}
	 	
		steps = steps.concat( collectStepsWorker(this) );
	});
	
  return steps;
}

function collectSteps() {
	
	var steps = new Array();

  $( '.slide' ).each(	function(i) {
		debug ( $(this).attr( 'id' ) + ':' );
		steps[i] = collectStepsWorker( this );
  });
	
	$( steps ).each( function(i) {
	  debug( 'slide ' + (i+1) + ': found ' + this.length + ' steps' );	
	});
       
  return steps;
}

