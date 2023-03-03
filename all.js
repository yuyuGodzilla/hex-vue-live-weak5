const BASE_URL = "https://vue3-course-api.hexschool.io/v2";
const API_PATH = "giganoto";


const productModal = {
    props: ["tempId","openModal"],
    data(){
        return {
            modal:{},
            tempProduct:{},
            qty:1,
        }
    },
    template: "#userProductModal",
    watch:{
        tempId:function(){
            // console.log("接受到產品id",this.tempId);
            if(this.tempId){
                axios.get(`${BASE_URL}/api/${API_PATH}/product/${this.tempId}`)
                    .then(res=>{
                        // console.log(res.data.product);
    
                        this.tempProduct = res.data.product;
                        this.qty=1;
                        this.modal.show();
    
                    })
                    .catch(err=>{
                        console.log(err);
                    })

            }
        },
    },
    methods:{
        hideModal(){
            this.modal.hide();
        }
    },
    mounted(){
        // 透過$refs 直接取得Modal元素
        this.modal = new bootstrap.Modal(this.$refs.modal);

        //註冊關閉modal時的，Event
        //注意傳統函式 vs 箭頭函式的 this指向
        this.$refs.modal.addEventListener('hidden.bs.modal',  (e) => {

            this.openModal("");
        })
    }
}

const app = Vue.createApp({
    data(){
        return {
            products: [],
            tempProductId: "",
            cart:{},
            loadingItemId:"",
            user:{},
            userMessage:"",
            myLoader:{},
        }
    },
    components:{
        productModal,
    },
    methods:{
        getProduct(){
            axios.get(`${BASE_URL}/api/${API_PATH}/products/all`)
                .then(res=>{
                    // console.log(res.data.products);

                    this.products = res.data.products;
                    this.myLoader.hide();
                })
                .catch(err=>{
                    console.log(err);
                })

        },
        openModal(id){
            this.tempProductId = id;
            // console.log(this.tempProductId);
        },
        //參數預設值
        addToCart(product_id,qty=1){
            // console.log("購物車被觸發")
            
            const data = {
                product_id,
                qty,
            };

            this.loadingItemId= product_id;

            axios.post(`${BASE_URL}/api/${API_PATH}/cart`,{ data })
                .then(res=>{
                    // console.log(res.data);
                    this.$refs.productModal.hideModal();
                    this.getCart();
                    this.loadingItemId="";
                })
                .catch(err=>{
                    console.log(err);
                    this.loadingItemId="";
                })
        },
        getCart(){
            axios.get(`${BASE_URL}/api/${API_PATH}/cart`)
                .then(res=>{
                    // console.log(res.data);
                    this.cart = res.data.data;
                })
                .catch(err=>{
                    console.log(err);
                })
        },
        updateCartItem(item){
            const data = {
                product_id: item.product_id,
                qty:item.qty,
            };
            // console.log(item,data);
            this.loadingItemId= item.id;
            axios.put(`${BASE_URL}/api/${API_PATH}/cart/${item.id}`,{ data })
                .then(res=>{
                    // console.log(res.data);
                    this.getCart();
                    this.loadingItemId= "";
                })
                .catch(err=>{
                    console.log(err);
                    this.loadingItemId= "";
                })
        },
        deleteCartItem(item){

            this.loadingItemId= item.id;
            axios.delete(`${BASE_URL}/api/${API_PATH}/cart/${item.id}`)
                .then(res=>{
                    // console.log(res.data);
                    this.getCart();
                    this.loadingItemId= "";
                })
                .catch(err=>{
                    console.log(err);
                    this.loadingItemId= "";
                })
        },
        deleteCartAll(){
            axios.delete(`${BASE_URL}/api/${API_PATH}/carts`)
                .then(res=>{
                    console.log(res.data);
                    this.getCart();
                })
                .catch(err=>{
                    console.log(err);
                })
        },
        onSubmit( ){
            // console.log("被submit");
            // console.log(this.user,this.userMessage)
            const data = {
                user: this.user,
                message: this.userMessage,
            };

            axios.post(`${BASE_URL}/api/${API_PATH}/order`,{
                data,
            })
                .then(res=>{
                    console.log(res.data);
                    this.getCart();
                    alert(res.data.message);
                })
                .catch(err=>{
                    console.log(err);
            });

            this.$refs.form.resetForm();
            this.userMessage="";

        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        },
    },
    mounted(){
        // let loader = this.$loading.show({
        //     // Pass props by their camelCased names
        //     container: this.$refs.loadingContainer,
        //     canCancel: false, // default false
        //     onCancel: this.yourCallbackMethod,
        //     color: '#000000',
        //     loader: 'bars',
        //     width: 128,
        //     height: 128,
        //     backgroundColor: '#000',
        //     opacity: 0.3,
        //     zIndex: 999,
        // });
        this.myLoader = this.$loading.show();
        
        this.getProduct();
        this.getCart();
    }
});


//註冊 VeeValidate
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

// VeeValidate.defineRule('email', VeeValidateRules['email']);
// VeeValidate.defineRule('required', VeeValidateRules['required']);

Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});


VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
  });


app.use(VueLoading.LoadingPlugin);
app.component('loading', VueLoading.Component)

app.mount("#app")