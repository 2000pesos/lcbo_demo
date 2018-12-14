<template>
  <div id="app">

    <!-- FORGIVE THE INLINE STYLES -->
    <div style="width: 50%; display: inline-block; margin: 0; padding-left: 8%;">
      <h3>Search LCBO products available near me</h3>
      <div style="text-align: center;">
        <input v-model="productsModel.search_term" @keyup.enter="searchProducts" type="text" placeholder="Search by product name, type, or keywords..." style="min-width: 250px;">
        <input @click="searchProducts" type="button" value="Search">
      </div>
      <div v-for="result in productsModel.product_results" class="result">
        <span style="display: inline-block; width: 75%; padding-top: 10px;">
          <img :src="result.image_thumb_url" style="max-height: 75px; float: left;">
          <big>{{result.name}}</big>&nbsp;&mdash;&nbsp;<small>{{result.package}}</small>
        </span>
        <span style="display: inline-block; width: 24%; text-align: right;">
          <a class="seeStoresLink" @click="searchStores(result)">Find nearby</a>
        </span>
        <br clear="left">
      </div>
      <div v-if="productsModel.noResults">
        Sorry, but no product results were found. 
      </div>

      <div v-if="productsModel.searching">
        <i>Searching...</i>
      </div>
    </div>

    <div v-show="storesModel.isActive" style="width: 45%; display: inline-block; vertical-align: top; border-left: 1px solid #aaaaaa; padding-left: 3%; margin-left: 3%;">
      <h3>Nearby Stores</h3>
      <h6><i>The following locations carry <br><big>{{storesModel.currentProduct.name}}</big> <small>{{storesModel.currentProduct.package}}</small>...</i></h6>
      <div v-for="result in storesModel.store_results" class="result">
        <span style="text-align: left"><i><strong>{{(result.distance_in_meters / 1000).toFixed(2)}}km</strong></i> &mdash; {{result.quantity}} in stock @ <strong>{{result.name}}</strong> <small><a :href="'https://www.google.com/maps?saddr=My+Location&daddr=' + result.address_line_1 + ',+' + result.city" target="_blank">({{result.address_line_1}}, {{result.city}})</a></small></span>
        <br clear="left">
      </div>
      <div v-if="storesModel.noResults">
        Sorry, but no store results were found. 
      </div>

      <div v-if="storesModel.searching">
        <i>Searching for stores nearby that carry {{storesModel.currentProduct.name}}...</i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      productsModel: {
        search_term: '',
        product_results: [],
        noResults: false,
        searching: false
      },
      storesModel: {
        isActive: false,
        currentProduct: {name: '', package: ''},
        store_results: [],
        noResults: false,
        searching: false
      },
      locationModel: {
        lat: '43.656700',
        lng: '-79.403910'
      }
    }
  },
  created () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.assignGeoData);
    } else {
        alert("Geolocation is not supported by this browser. Toronto will be used as your default location.");
    }
  },
  methods: {
    assignGeoData: function(position) {

      this.locationModel.lat = position.coords.latitude;
      this.locationModel.lng = position.coords.longitude;

      console.log('locationModel', this.locationModel);
    },
    searchProducts: function() {

      this.productsModel.searching = true;
      this.productsModel.product_results = [];
      fetch(`http://localhost:8081/products?search_term=${encodeURIComponent(this.productsModel.search_term)}`)
      .then(res => res.json())
      .then(res => {
        this.productsModel.searching = false;
        this.productsModel.product_results = res.results;
        this.productsModel.noResults = this.productsModel.product_results.length === 0;
        console.log('product_results', this.productsModel.product_results);
      });

    },

    searchStores: function(productObject) {

      this.storesModel.searching = true;
      this.storesModel.currentProduct = productObject;

      fetch(`http://localhost:8081/stores?product_id=${encodeURIComponent(productObject.id)}&lat=${encodeURIComponent(this.locationModel.lat)}&lng=${encodeURIComponent(this.locationModel.lng)}`)
      .then(res => res.json())
      .then(res => {
        console.log('store results', res.results);
        this.storesModel.searching = false;
        this.storesModel.isActive = true;
        this.storesModel.store_results = res.results;
        this.storesModel.noResults = this.storesModel.store_results.length === 0;
      });
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
#app .seeStoresLink {
  cursor: pointer;
  font-weight: bold;
  color: #228b22;
}
#app .result {
  text-align: left; 
  display: block;
  width: 100%;
  border-bottom: 1px solid #888888;
}
</style>
