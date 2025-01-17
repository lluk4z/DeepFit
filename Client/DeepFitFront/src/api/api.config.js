import router from '@/router'
// import store from './../modules/store'
import qs from 'qs'
import axios from 'axios'

export default new (class Config {
  constructor() {
    this._token = null
    this.axios = null
  }

  setToken(token, { type = 'Bearer' } = {}) {
    this._token = `${type} ${token}`
  }

  async setup() {
    try {
      // FALTA PEGAR UMA URL PARA EXECUTAR AS CHAMADAS NO AXIOS
      let baseURL = `API_BASE_URL`
      const withCredentials = true
      const axiosSetup = {
        paramsSerializer: (params) => {
          return qs.stringify(params)
        },
        withCredentials,
        baseURL
      }
      this.axios = axios.create(axiosSetup)
      this.axios.interceptors.request.use(
        (request) => {
          // FALTA TER PADRAO DO TOKEN QUE VAMOS USAR PARA ACESSAR A API
          if (this._token.startsWith('BearerStatic')) {
            request.headers.BearerStatic = this._token.replace('BearerStatic', '')
          } else {
            request.headers.Authorization = this._token
          }
          return request
        },
        (error) => {
          return Promise.reject(error)
        }
      )
      this.axios.interceptors.response.use(
        /**
         *
         * @param {import('axios').AxiosResponse} response
         */
        (response) => {
          return response
        },
        /**
         *
         * @param {import('axios').AxiosError} error
         */
        async (error) => {
          // APENAS EXEMPLOS DE TRATAMENTO DE ERRO
          const { response } = error
          if (response?.status === 400) {
            // EXEMPLO DE CHAMADA DE UMA FUNCAO DENTRO DOS MODULOS DE USUARIO ONDE TEMOS O STATUS DO USUARIO: logged, logedUser, list
            // NESSE CASO CHAMAOS A FUNCAO logout
            // store.dispatch('users/logout')
            router.push({ name: 'home' })
            return
          }
          if (response?.status === 401) {
            return { status: 401, message: response.data?.error }
          }
          if (Object.keys(response?.data || {})?.length > 0) {
            const error = new Error()
            error.status = response.status
            error.message = response.data?.message || response.data
            error.errors = response.data?.errors
            throw error
          }
          return Promise.reject(error)
        }
      )
    } catch (err) {
      console.error(err)
    }
  }
})()
