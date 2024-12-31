

async function main(){
    console.log('hello')
}

export async function test(element: HTMLButtonElement){
    element.addEventListener('click', () => main())
}