helpers.startCasper({
  useFxA: true,
  setUp: function(){
    helpers.fakeFxA();
    casper.on('url.changed', function () {
      helpers.fakeFxA();
      helpers.fakeStartTransaction();
      helpers.fakePinData({data: {pin: true}});
      helpers.fakePinData({data: {pin: true}, method: 'POST', statusCode: 200, url: '/mozpay/v1/api/pin/check/'});
    });
  },
  tearDown: function() {
    casper.removeAllListeners('url.changed');
  }
});

casper.test.begin('Enter Pin API call returns 200', {
  test: function(test) {

    casper.waitForUrl(helpers.url('enter-pin'), function() {
      test.assertVisible('.pinbox', 'Pin entry widget should be displayed');
      this.sendKeys('.pinbox', '1234');
      test.assertExists('.cta:enabled', 'Submit button is enabled');
      this.click('.cta');
      test.assertExists('.cta:disabled', 'Submit button is disabled on click');
    });

    casper.then(function() {
      var request = helpers.getApiRequest('/mozpay/v1/api/pay/');
      casper.test.assertEqual(request.requestBody,
                              '{"req":"foo"}',
                              'invalid jwt sent');
    });

    casper.waitForUrl(helpers.url('wait-to-start'), function() {
      test.assertVisible('.progress');
    });

    casper.run(function() {
      test.done();
    });
  },
});
