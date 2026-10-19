(function () {
  fetch('/intercom-token')
    .then(function (response) {
      if (!response.ok) throw new Error('Intercom identity token request failed');
      return response.json();
    })
    .then(function (identity) {
      window.intercomSettings = {
        api_base: 'https://api-iam.intercom.io',
        app_id: 'ofbapl3e',
        user_id: identity.user_id,
        intercom_user_jwt: identity.token
      };

      var intercom = window.Intercom;
      if (typeof intercom === 'function') {
        intercom('reattach_activator');
        intercom('update', window.intercomSettings);
        return;
      }

      var queue = function () { queue.c(arguments); };
      queue.q = [];
      queue.c = function (args) { queue.q.push(args); };
      window.Intercom = queue;

      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://widget.intercom.io/widget/ofbapl3e';
      document.getElementsByTagName('script')[0].parentNode.insertBefore(script, document.getElementsByTagName('script')[0]);
    })
    .catch(function (error) {
      console.error('Unable to initialize Intercom:', error);
    });
})();