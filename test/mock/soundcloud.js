'use strict';

angular.module('mockedApp', []).provider('mockSC', function () {
  this.$get = function () {
    return {
      urlType: function() {
        return 'user';
      },
      getUser: function(id) {
        console.log(id);
        return {
          'id': {
            '-type': 'integer',
            '#text': '41257'
          },
          'kind': 'user',
          'permalink': 'capyac',
          'username': 'CAPYAC',
          'uri': 'https://api.soundcloud.com/users/41257',
          'permalink-url': 'http://soundcloud.com/capyac',
          'avatar-url': 'https://i1.sndcdn.com/avatars-000037910794-5bwy79-large.jpg?e76cf77',
          'country': { '-nil': 'true' },
          'description': 'Je suis le capyac.',
          'city': 'Outer Space',
          'discogs-name': { '-nil': 'true' },
          'myspace-name': { '-nil': 'true' },
          'website': { '-nil': 'true' },
          'website-title': { '-nil': 'true' },
          'online': {
            '-type': 'boolean',
            '#text': 'false'
          },
          'track-count': {
            '-type': 'integer',
            '#text': '16'
          },
          'playlist-count': {
            '-type': 'integer',
            '#text': '1'
          },
          'plan': 'Pro',
          'public-favorites-count': {
            '-type': 'integer',
            '#text': '93'
          },
          'followers-count': {
            '-type': 'integer',
            '#text': '380'
          },
          'followings-count': {
            '-type': 'integer',
            '#text': '206'
          },
          'subscriptions': {
            '-type': 'array',
            'subscription': {
              'product': {
                'id': 'creator-pro',
                'name': 'Pro'
              }
            }
          }
        };
      }
    };
  };
});