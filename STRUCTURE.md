## 📁 Estrutura de Pastas

Até o momento, nosso projeto possui a seguinte estrutura:

```
api
├ prisma
├ src
│  ├ auth
│  ├ common
│  ├ email
│  ├ gerente
│  └ prisma
└ test
```

Tudo que está dentro de `/src` representa uma funcionalidade específica do sistema e está separado por pastas para manter a organização.

---

## 🔍 Objetivo de cada pasta

- **auth**  
  Rota responsável por login e cadastro. Tudo que for relacionado à autenticação entra aqui.

- **common**  
  Contém o filtro de erro global. Qualquer erro que acontecer no sistema passa por aqui e é formatado para facilitar o entendimento.

- **email**  
  Guarda as funções de envio de e-mail. Qualquer rota que precisar enviar e-mails pode usar os arquivos dessa pasta.

- **gerente**  
  Tudo relacionado ao usuário gerente está aqui. Se quiser adicionar, remover ou modificar funcionalidades do gerente, é nessa pasta.

- **prisma (dentro de src)**  
  Contém o service que integra o Prisma ao NestJS. Sempre que for usar Prisma dentro de alguma funcionalidade, essa é a pasta onde ele está implementado.





