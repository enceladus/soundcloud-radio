'use strict';

angular.module('scradioApp').factory('Stations', function() {
  /* jshint camelcase: false */
  var self = this;

  self.stations = [];

  var reduceSeed = function(seed) {
    return {
      id: seed.id,
      username: seed.username,
      permalink: seed.permalink,
      permalink_url: seed.permalink_url,
      avatar_url: seed.avatar_url,
      kind: seed.kind,
      followings_count: seed.followings_count,
      public_favorites_count: seed.public_favorites_count
    };
  };

  self.addStation = function(seeds, title) {
    if (!seeds.length) {
      return;
    }

    if (!title) {
      title = seeds[0].username + ' radio';
    }

    for (var i = 0; i < seeds.length; i++) {
      seeds[i] = reduceSeed(seeds[i]);
    }

    self.stations.push({
      title: title,
      seeds: seeds,
      active: false
    });

    return self.stations;
  };

  self.addSeedToStation = function(station, seed) {
    for (var i = 0; i < self.stations.length; i++) {
      if (self.stations[i] === station) {
        self.stations[i].seeds.push(reduceSeed(seed));
        return;
      }
    }
  };

  self.removeSeedFromStation = function(station, seed) {
    for (var i = 0; i < self.stations.length; i++) {
      if (self.stations[i] === station) {
        for (var j = 0; j < self.stations[i].seeds.length; j++) {
          if (self.stations[i].seeds[j] === seed) {
            self.stations[i].seeds.splice(j, 1);
          }
        }
      }
    }
  };

  self.removeStationByTitle = function(title) {
    for (var i = 0; i < self.stations.length; i++) {
      if (self.stations[i].title === title) {
        self.removeStation(i);
      }
    }
  };

  self.removeStation = function(index) {
    self.stations.splice(index, 1);
    return self.stations;
  };

  self.saveStations = function() {
    localStorage.setItem('scr_stations', JSON.stringify(self.stations));
  };

  self.loadStations = function() {
    return localStorage.getItem('scr_stations') || [];
  };

  return self;
});