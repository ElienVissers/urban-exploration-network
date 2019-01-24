(function() {

    Vue.component('img-modal', {
        template: '#img-modal-template',
        data: function() {
            return {
                url: "",
                title: "",
                description: "",
                username: "",
                uploadTime: "",
                comments: [],
                comment: {
                    text: "",
                    name: ""
                }
            };
        },
        props: ['id'],
        methods: {
            sendCloseEvent: function(e) {
                if (e.target == document.getElementById('img-modal')) {
                    this.$emit('close');
                } else {
                    return;
                }
            },
            addComment: function(e) {
                e.preventDefault();
                var self = this;
                axios.post('/comment/' + self.id + '/add', {
                    text: self.comment.text,
                    name: self.comment.name
                }).then(function(results) {
                    self.comments.unshift(results.data[0]);
                    self.comment.text = "";
                    self.comment.name = "";
                });
            }
        },
        mounted: function() {
            var self = this;
            axios.get('/image/' + self.id + '/data').then(function(results) {
                self.url = results.data[0].url;
                self.title = results.data[0].title;
                self.description = results.data[0].description;
                self.username = results.data[0].username;
                self.uploadTime = results.data[0].created_at.slice(0, 10);
            });
            axios.get('/image/' + self.id + '/comments').then(function(results) {
                if (results.data.length > 0) {
                    for (let i = 0; i < results.data.length; i++) {
                        self.comments.unshift(results.data[i]);
                    }
                }
            });
        },
        watch: {
            //the function id will run everytime the id (= a prop) changes (the watcher will listen for a prop or data change)
            id: function() {
                var self = this;
                axios.get('/image/' + self.id + '/data').then(function(results) {
                    self.url = results.data[0].url;
                    self.title = results.data[0].title;
                    self.description = results.data[0].description;
                    self.username = results.data[0].username;
                    self.uploadTime = results.data[0].created_at.slice(0, 10);
                }).catch(function() {
                    self.$emit('close');
                });
                axios.get('/image/' + self.id + '/comments').then(function(results) {
                    self.comments = [];
                    if (results.data.length > 0) {
                        for (let i = 0; i < results.data.length; i++) {
                            self.comments.unshift(results.data[i]);
                        }
                    }
                }).catch(function() {
                    self.$emit('close');
                });
            }
        }
    });

    new Vue({
        el: '#main',
        data: {
            images: [],
            form: {
                title: '',
                name: '',
                description: '',
                file: null
            },
            currentImage: window.location.hash.slice(1),
            lowest_id: null
        },
        mounted: function() {
            var self = this;
            //modal pops up when user clicks on an image
            window.addEventListener('hashchange', function() {
                self.currentImage = window.location.hash.slice(1);
            });
            axios.get('/images').then(function(response) {
                // console.log("response from /images to axios: ", response);
                self.images = response.data;
            });
        },
        methods: {
            uploadFile: function(e) {
                var self = this;
                e.preventDefault();
                var file = document.getElementById('file');
                var uploadedFile = file.files[0];
                // use the formData API to send files to server --> pass it a key value pair with the key as a description and the value the file you want to send
                // console.log("this: ", this); /*this refers to the Vue instance*/
                var formData = new FormData();
                formData.append('uploadedFile', uploadedFile);
                formData.append('title', this.form.title);
                formData.append('description', this.form.description);
                formData.append('name', this.form.name);

                axios.post('/upload', formData).then(function(response) {
                    console.log("response: ", response);
                    console.log("self: ", self);
                    self.images.unshift(response.data);
                });
            },
            moreContent: function() {
                var self = this;
                axios.get('/images/' + this.images[this.images.length -1].id + '/more').then(function(response) {
                    self.images = self.images.concat(response.data[0].rows);
                    self.lowest_id = response.data[1].rows[0].lowest_id;
                });
            },
            hideModal: function() {
                window.location.hash = '';
            }
        }
    });
})();
