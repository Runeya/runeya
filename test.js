const a = {a:'a', b:'b'}

console.log('Starting script...')
debugger
console.log('Step 1:', a)

a.a = 'modified'
debugger
console.log('Step 2:', a)

a.b = 'modified too'  
debugger
console.log('Step 3:', a)

console.log('Script finished!')
