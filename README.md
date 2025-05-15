# API Projeto Integrador : KdABoa

## Descrição
Esse repositorio guarda um sistema para manter a relação do front-end do mesmo proejeto com o banco, auxiliando nas requisições, alteração de dados, e segurança de todo o projeto. O projeto integrador é um trabalho que nos alunos da FATEC realizamos para aprender e entender todo o trabalho realizado no desinvolvimento de um sistema, levantando seus requisitos, realizando documentação e criação do sistema.

No caso de quererem ver como está sendo estruturado nosso front-end é só [clicar aqui](https://github.com/GustavoAzvdo/PI_KDaBoa)

---

## Objetivos
- **Auxiliar** o front-end a conseguir dados do banco de dados;
- **Manter seguro** acesso aos dados e utilitários do sistema;
- **Organizar** as funcionalidades de todo o projeto.

---

## Ferramentas e Tecnologias Utilizadas
- **Node.Js**
- **NestJS**
- **Prisma**
- **JWT**
- **Nodemailer**
- **Ejs**
- **Cors**

---

## Organização do projeto
O projeto é separado por cada pacote para facilitar manutenção e escalabilidade de todo o projeto

para melhor entendimento segue a [descrição de todas as pastas](./STRUCTURE.md)

---

## Teste em seu computador

### Pré-requisitos
- **Node.Js** instalado na máquina;
- **MySql** configurado;
- **NestJs** para rodar o projeto;

### Passos para configurar
1. Clone o repositorio:
   ```bash
   git clone <URL_DO_PROJETO>
   cd api_kdaboa
   ```
   
2. Crie o arquivo .env:
   - Crie o arquivo que carrega as variaveis de habiente do sistema, o .env deve ser gerado na raiz do projeto deixandocom essa estrutura de paginas:
     ```
     api
     ├prisma
     ├src
     └test
     .env
     ```
3. Configure o banco de dados:
   - O prisma já carrega o banco de dados automaticamente, só precisamos configuar sua relação com ele na nossa maquina. Para isso vamos escrever algumas coisas dento do .env que criamos
     ```.env
     DATABASE_URL="mysql://<seu_nome_de_usuario_do_banco>:<sua_senha_para_acessar_o_banco>@localhost:3306/<nome_do_banco>
     STATUS_VERIFICADO="<qualquer numero>"
     STATUS_CRIADO="<qualquer numero>"
     ```

   - O DATABASE_URL é o link que o prisma usa para acessar seu banco de dados, para melhor entendimento [clique aqui](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/connect-your-database-typescript-mysql)
   - As variaveis de status é o que o sistema usa para saber em qual estado está o usuário, você pode escoler qualquer número entre 0 até 128, **as váriaveis não podem ter o mesmo número**
  
   - após tudo isso rode os seguintes comando no terminal para que o prisma suba altomaticante nosso banco de dados
     ```bash
     # 1. Instala as dependências (caso ainda não tenha rodado)
     npm install
      
     # 2. Cria as tabelas no banco de dados com base nos modelos
     npx prisma migrate dev --name init
      
     # 3. Gera o client do Prisma (recomendado após alterações no schema)
     npx prisma generate
     ```
4. Configure suas variaveis de autenticação
   - Para gerar tokens corretamente preciamos configurar nossas chaves, novamente vamos escrever algumas variaveis no nosso .env
     ```.env
     SECRET="<seu_secret>"
     ```
   - O secret é algua senha que vocẽ carrega para dar mais segurança aos tokes, ele pode ser qualquer coisa

5. Configure suas variaveis para as funções de enviar email
   - Neste projeto estamos usando Nodemailer para enviar emails e verificar se o email em si existe, para isso vamos adicionar mais duas variaveis no .env
     ```.env
     EMAIL_USER="<seu_email>"
     EMAIL_PASS="<sua_senha>"
     ```
   - Para alguns seviços de email devemos adicionar algumas configurações a mais, no nosso caso estamos usando o gmail, mas para outros serviços será necessário adicioar outras configuraçẽos, segue o link para [configurar seu nodemailer](https://nodemailer.com/usage) e [onde você deve configurar seu nodemailer](https://github.com/Jhonathan-Will/api_kdaboa/blob/main/api/src/email/email.service.ts)
