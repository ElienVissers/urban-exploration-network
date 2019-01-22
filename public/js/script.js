(function() {
    new Vue({
        el: '#main',
        data: {
            images: [],
            form: {
                title: '',
                name: '',
                description: '',
                file: null
            }
        },
        mounted: function() {
            var self = this;
            axios.get('/images').then(function(response) {
                console.log("response from /images to axios: ", response);
                self.images = response.data;
            });
        },
        methods: {
            uploadFile: function(e) {
                e.preventDefault();
                var file = document.getElementById('file');
                var uploadedFile = file.files[0];
                // use the formData API to send files to server --> pass it a key value pair with the key as a description and the value the file you wanna send
                // console.log("this: ", this); /*this refers to the Vue instance*/
                var formData = new FormData();
                formData.append('uploadedFile', uploadedFile);
                formData.append('title', this.form.title);
                formData.append('description', this.form.description);
                formData.append('name', this.form.name);

                axios.post('/upload', formData).then(function() {

                });
            }
        }
    });
})();
