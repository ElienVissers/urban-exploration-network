(function() {
    new Vue({
        el: '#main',
        data: {
            images: []
        },
        mounted: function() {
            var self = this;
            axios.get('/images').then(function(response) {
                console.log("response from /images to axios: ", response);
                self.images = response.data;
            });
        }
    });
})();
