// Author: Ryan Heath
// http://rpheath.com

/**
ADDED JSON response handling & multiple input fields handling  & processing through jquery tmpl (http://ejohn.org/blog/javascript-micro-templating/ & one of its forks like https://github.com/BorisMoore/jquery-tmpl)
Added updates from others forks.

changes: data & tmpl
- data : jquery selector for collecting data to submit
- tmpl : if you use the john resig tmpl, & the server returns back JSON, then it is evaluated for every row
now you can call it like this:

$('input.search').searchbox({
  url: your_url,
  param: 'q',
  dom_id: '#resultTable',
  delay: 250,
  data: 'input.search',
  tmpl: '<tr> <td>${brand} </td>    <td>${model} </td>  </tr>'
})


if you have inputs like this:
    <input type="text" id=brand class="form-control search">
    <input type="text" id=model class="form-control search">
then you will receive in the GET request values as: brand=value&model=value
for all the input that are defined by the 'data' parameter
so you can have multiple fields & still use a live search form

*/

(function($) {
  $.searchbox = {}
  
  $.extend(true, $.searchbox, {
    settings: {
      url: '/search',
      param: 'query',
      dom_id: '#results',
      total_dom_id: '#total',
      delay: 100,
      loading_css: '#loading',
      data: null,
      tmpl: null,
      characters: 3
    },
    
    loading: function() {
      $($.searchbox.settings.loading_css).show()
    },
    
    resetTimer: function(timer) {
      if (timer) clearTimeout(timer)
    },
    
    idle: function() {
      $($.searchbox.settings.loading_css).hide()
    },
    
    process: function(terms) {
        
        //Added a check for 'blank', so search is not triggered on empty string…
       if(terms)
       { 
        var blank_check = terms.replace(/\s/g, '');
        if(blank_check == ''){return false;}  
       }
       
      var path = $.searchbox.settings.url.split('?'),
        query = [$.searchbox.settings.param, '=', terms].join(''),
        base = path[0], params = path[1], query_string = query
      
      if (params) query_string = [params.replace('&amp;', '&'), query].join('&')

      alldata={};
      if ($.tmpl && $.searchbox.settings.data)
      $(  $.searchbox.settings.data ).each( function(id,ctrl) { alldata[ ctrl.id ]=ctrl.value;  } );
     
      if ($.tmpl && $.searchbox.settings.tmpl)
        $.ajax({
          dataType: "json",
          data: alldata,
          url: [base, '?', query_string].join(''),
          success: function(data) {
               records_info=data.pop();
//               records_info.total
//               records_info.offset 
//               records_info.size
               $($.searchbox.settings.total_dom_id).html( records_info.total );
               $($.searchbox.settings.dom_id).html( $.tmpl($.searchbox.settings.tmpl, data) );
          }
        })
    else
    
      $.get([base, '?', query_string].join(''), function(data) {
        $($.searchbox.settings.dom_id).html(data)
      })
                                                                                  
                                                                                  
      
    },
    
    start: function() {
      $(document).trigger('before.searchbox')
      $.searchbox.loading()
    },
    
    stop: function() {
      $.searchbox.idle()
      $(document).trigger('after.searchbox')
    }
  })
  
  $.fn.searchbox = function(config) {
    var settings = $.extend(true, $.searchbox.settings, config || {})
    
    $(document).trigger('init.searchbox')
    $.searchbox.idle()
    
    return this.each(function() {
      var $input = $(this)
      
      $input
      .focus()
      .ajaxStart(function() { $.searchbox.start() })
      .ajaxStop(function() { $.searchbox.stop() })
      .keyup(function() {
        
        if ($input.val() != this.previousValue && 
        //starts when  x characters typed
        ($input.val().length >= $.searchbox.settings.characters
        //except if character removed
         || this.previousValue==null || this.previousValue.length>$input.val().length)
        ) {    
          $.searchbox.resetTimer(this.timer)

          this.timer = setTimeout(function() {  
            $.searchbox.process($input.val())
          }, $.searchbox.settings.delay)
        
          this.previousValue = $input.val()
        }
      })
    })
  }
})(jQuery);
