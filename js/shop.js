// Allows us to grab cookies, useful for retrieving the CSRF TOKEN needed in requests
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$(document).ready(function() {
// Variables
    var csrftoken = getCookie('csrftoken');
    var gateway_options = $('.checkout .gateways input[type=radio]');
    var card_details_form = $('.card-details');

// If STRIPE is selected then show card details form else hide it
    gateway_options.change(function () {
        // Show card details if selected gateway is STRIPE
        if ($(this).data('id') == '5') {
            card_details_form.show();
        } else {
            card_details_form.hide();
        }

    });


// Check if STRIPE is the only gateway if so show card information
    if (gateway_options.length == 1) {
        if (gateway_options.data('id') == '5') {
            card_details_form.show();
        }
    }

// Complete checkout submit form
    $(document).on('submit', '.checkout-pay', function () {
        form = $(this);
        button = $(form).find(".complete-complete");
        button.button('Completing checkout');

        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: form.serialize(),
            dataType: "json",
            success: function (json) {

                // IF GATEWAY STRIPE
                if (json.gateway == '5') {
                    // Set pub key

                    Stripe.setPublishableKey(json.data.key);

                    // Create token from form data and handle response
                    Stripe.card.createToken({
                        // CARD DETAILS
                        number: $('.card-details input[name="card-number"]').val(),
                        cvc: $('.card-details input[name="cvc"]').val(),
                        exp_month: $('.card-details select[name="exp-month"]').val(),
                        exp_year: $('.card-details select[name="exp-year"]').val(),
                        // BILLING INFORMATION
                        name: '',
                        address_line1: '',
                        address_line2: '',
                        address_city: '',
                        address_state: '',
                        address_zip: '',
                        address_country: ''
                    }, function (status, response) {

                        if (response.error) {
                            // Handle response, show error message?
                            console.log(response.error)
                        } else {
                            // Successfully got token back so lets pass this to the MinecraftMarket servers
                            $.ajax({
                                type: 'POST',
                                url: json.data.post_url,
                                data: {token: response.id, csrfmiddlewaretoken: csrftoken},
                                dataType: "json",
                                success: function (response) {
                                    if (response.complete) {
                                        window.top.location.replace(json.data.redirect_url);
                                    } else {
                                        // Handle error here, show error message?
                                        console.log(response.error);
                                    }
                                }
                            });
                        }
                    });
                } else {
                    // Redirect user to external checkout page url returned by server (Paypal, Paymentwall etc)
                    window.top.location.replace(json.data.redirect_url);
                }
            },
            error: function (data) {
                // Handle checkout complete form submit error here, show error message?
                console.log('Unable to complete checkout, please try again.')
            }
        });
        return false;
    });
});

$('.checkout-update').click(function() {
    var form = $('#checkout-update-form');
    $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize(),
        success: location.reload()
    });

});

$(".modalToggle").on("click", function (e) {
    var t = $(this).data("remote"), n = $(this).data("focus-input");
    $("#mainModal").load(t, function () {
        console.log("loaded");
    }),
        $("#mainModal").modal("show"), e.preventDefault()
});
    $("#mainModal").on("hidden.bs.modal", function () {
    $("#mainModal").empty()
});

$('#set_language').change(function () {
    $(this).closest('#set_language').submit();
});

$('.gateway').click(function(){
   $('.selected-gateway').removeClass('selected-gateway'); // removes the previous selected class
   $(this).addClass('selected-gateway'); // adds the class to the clicked image
});
