$(document).ready(function() {

    var report = $('.review-reason').html();

    $('.review-reason').popup('.flag-review', {
        delegate: $(document.body),
        width: 'inherit',
        callback: function(obj) {
            var ct = $(obj.click_target),
                $popup = this;
            //reset our event handlers
            $popup.hideMe();

            function addFlag(flag, note) {
                $.ajax({type: 'POST',
                        url: ct.attr('href'),
                        data: {flag: flag, note: note},
                        success: function() {
                            $popup.removeClass('other')
                                  .hideMe();
                            ct.closest('.item').addClass('flagged');
                            ct.replaceWith(gettext('Flagged for review'))
                              .addClass('flagged');
                        },
                        error: function(){ },
                        dataType: 'json'
                });
            };

            $popup.delegate('li a', 'click', function(e) {
                e.preventDefault();
                var el = $(e.target);
                if (el.attr('href') == '#review_flag_reason_other') {
                    $popup.addClass('other')
                          .delegate('form', 'submit', function(e) {
                              e.preventDefault();
                              var note = $popup.find('#id_note').val();
                              if (!note) {
                                  alert(gettext('Your input is required'));
                              } else {
                                  addFlag('review_flag_reason_other', note);
                              }
                          })
                          .setPos(ct)
                          .find('input[type=text]')
                          .focus();
                } else {
                    addFlag(el.attr('href').slice(1));
                }
            });

            $popup.removeClass("other");
            $popup.html(report);
            return { pointTo: ct };
        }
    });

    $('.primary').delegate('.review-edit', 'click', function(e) {
        e.preventDefault();
        var $form = $('#review-edit-form'),
            $review = $(this).closest('.review'),
            rating = $review.attr('data-rating'),
            edit_url = $('a.permalink', $review).attr('href') + 'edit',
            $cancel = $('#review-edit-cancel');

        clearErrors($form);
        $review.attr('action', edit_url);
        $form.detach().insertAfter($review);
        $('#id_title').val($review.find('h3 > b').text());
        $('.ratingwidget input:radio[value=' + rating + ']', $form).click();
        $('#id_body').val($review.children('p.description').html().replace("<br>", "\n", "g"));
        $review.hide();
        $form.show();
        location.hash = '#review-edit-form';

        function done_edit() {
            clearErrors($form);
            $form.unbind().hide();
            $review.show();
            $cancel.unbind();
        }

        $cancel.click(_pd(done_edit));

        $form.submit(function (e) {
            e.preventDefault();
            $.ajax({type: 'POST',
                url: edit_url,
                data: $form.serialize(),
                success: function(response, status) {
                      clearErrors($form);
                      $review.find('h3 > b').text($('#id_title').val());
                      var rating = $('.ratingwidget input:radio:checked', $form).val();
                      $('.stars', $review).removeClass('stars-0 stars-1 stars-2 stars-3 stars-4 stars-5').addClass('stars-' + rating);
                      rating = $review.attr('data-rating', rating);
                      $review.children('p.description').html($('#id_body').val().replace("\n", "<br>", "g"));
                      done_edit();
                },
                error: function(xhr) {
                    var errors = $.parseJSON(xhr.responseText);
                    populateErrors($form, errors);
                },
                dataType: 'json'
            });
            return false;
        });
    });


    $('.delete-review').click(function(e) {
        e.preventDefault();
        var target = $(e.target);
        $.post(target.attr('href'), function() {
            target.replaceWith(gettext('Marked for deletion'));
        });
        target.closest('.review').addClass('deleted');
    });

    $('select[name="rating"]').ratingwidget();
});
