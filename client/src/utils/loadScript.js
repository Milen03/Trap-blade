// Зарежда външен <script> (например на Google или Apple) само веднъж,
// дори да го поискат няколко компонента или един компонент да се покаже няколко пъти.
const loading = new Map()

export function loadScript(src) {
  if (!loading.has(src)) {
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        // Махаме неуспешния опит, за да може следващият път да пробваме наново.
        loading.delete(src)
        script.remove()
        reject(new Error(`Неуспешно зареждане на ${src}`))
      }
      document.head.appendChild(script)
    })
    loading.set(src, promise)
  }
  return loading.get(src)
}
