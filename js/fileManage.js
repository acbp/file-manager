/** Iniciar após 'deviceready'  */
function init_fileManage(){
    var 
        /**  Valor em MegaBytes. */
        _size,
        /**  Valor em _fileType */
        _fileType = 0,
        /** Tipos para criação de arquivos */
        localType = [ LocalFileSystem.PERSISTENT, LocalFileSystem.TEMPORARY ];
    return {
        // getters e setters
        // getter de size
        get size(){
            return _size;
        },
        // setter de size
        set size( number ){
            if(number>0) if(number<10)
                _size = number;
        },
        // getter de fileType
        get fileType(){
            return _fileType;
        },
        // setter de fileType
        set fileType( number ){
            number=~~number;
            if(number>-1) if(number<2)
                _fileType = number;
        },
        // metodos publicos
        /**
         * Dados do arquivo a ser criado.
         * 
         * @param {object}   file          - configuração do arquivo.
         * @prop  {string}   file.name     - nome do arquivo buscado.
         * @prop  {string}   file.data     - dados do objetos.
         * @prop  {object=}   file.options  - se é para criar e/ou se é exclusivo.Padrão: {create:true}
         * @prop  {function=} file.callback - callback para sucesso.
         * @prop  {boolean=}  file.append   - incrementa arquivo com dados.
         */
        write:( requestFile.bind( undefined, writeFile) ),
        /**
         * Dados do arquivo a ser lida.
         * 
         * @param {object}   file          - configuração do arquivo.
         * @prop  {string}   file.name     - nome do arquivo buscado.
         * @prop  {function=} file.callback - callback para sucesso.
         */
        read:( requestFile.bind( undefined, readFile) ),
        /**
         * Dados do arquivo a ser lida.
         * 
         * @param {object}   file          - configuração do arquivo.
         * @prop  {string}   file.name     - nome do arquivo buscado.
         * @prop  {function=} file.callback - callback para sucesso.
         */
        delete:( requestFile.bind( undefined, deleteFile) ),
    };
    /**
     * Intermediário para leitura/escrita/delete.
     * 
     * @param   {function}  fn   - função a ser executada, write/read/delete
     * @param   {object}    file - configuração para arquivo/pasta.
     * @returns {undefined} mensagem de erro.
     */
    function requestFile( fn, file ){
        if( !file ) 
            return console.error('Sem paramêtro file.');
        return window.requestFileSystem( localType[ _fileType ], 1024 * 1024 * _size  , fn.bind(file) , onError);
    }
    /** 
     * Tratamento para erros, na criação de arquivos.
     *
     * @param {object} e - tipo de erro gerado.
     */
    function onError(e) {
        var msg = '';
        switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
        };
        console.log('erro em ' + arguments.callee.name, '\nErro:' + msg);
    }
    /**
     * Pegar/Cria arquivo no aparelho.
     * 
     * @param {object} fs - fileSystem object, permite manipular arquivos no aparelho.
     */
    function writeFile(fs) {
        if( !(fs instanceof Entry) ) fs=fs.root;
        fs.getFile(this.name, this.options||{create:true}, wf.bind( undefined, this.data, this.callback, this.append ) , onError );
    }
    /**
     * Escreve dados no objeto.
     * 
     * @param {object}  fileEntry             - arquivo a ser lido.
     * @param {object}  this                  - 'file' aplicado no contexto.
     * @param {object}  this.data             - dados que serão gravados.
     * @param {object}  this.callback         - tratamento para sucesso e erro.
     * @prop  {object}  this.callback.success - realizar chamada em caso de sucesso.
     * @prop  {object}  this.callback.error   - realizar chamada em caso de erro.
     * @param {boolean} this.isAppend         - insere 'dataObj' no final do arquivo.
     */
    function wf(data,callback,append,fileEntry) {
        if (!data || !fileEntry) {
            return console.log('não foi gravado nenhum dado.\n>:', arguments);
        }
        // Create a FileWriter object for our FileEntry.
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function () {
                console.log("Successful file writed...");
                if(callback && callback.success ) callback.success(fileEntry);
            };
            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + e.toString());
                if(callback && callback.error ) callback.error();
            };
            // é para adicionar dados em um arquivo existente ?
            if (append) {
                // poem no final do arquivo, se existir.
                try {
                    fileWriter.seek(fileWriter.length);
                } catch (e) {
                    console.log('não foi possível dar "isAppend".');
                }
            }
            fileWriter.write(
                new Blob(
                    [data],
                    {type:'text/plain;charset=utf-8'}
                )
            );
        });
    }
    /**
     * Pegar/Cria arquivo no aparelho.
     * 
     * @param {object} fs - fileSystem object, permite manipular arquivos no aparelho.
     */
    function readFile(fs) {
        if( !(fs instanceof Entry) ) fs=fs.root;
        fs.getFile(this.name, this.options || {}, rf.bind( undefined, this.callback ) , onError );
    }
    /**
     * Realiza leitura de um arquivo.
     * 
     * @param {object} fileEntry        - arquivo a ser lido.
     * @param {object} callback         - tratamento para sucesso e erro.
     * @prop  {object} callback.success - realizar chamada em caso de sucesso.
     * @prop  {object} callback.error   - realizar chamada em caso de erro.
     */
    function rf(callback,fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
                console.log("Successful file readed");
                if(callback && callback.success ) callback.success(this.result);
            };
            reader.onerror = function(){
                console.log("Failed file read");
                if(callback && callback.error ) callback.error();
            }
            reader.readAsText(file);
        }, onError.bind(this));
    }
    /**
     * Pegar/Cria arquivo no aparelho.
     * 
     * @param {object} fs - fileSystem object, permite manipular arquivos no aparelho.
     */
    function deleteFile(fs) {
        if( !(fs instanceof Entry) ) fs=fs.root;
        fs.getFile(this.name, this.options || {create:false}, df.bind( undefined, this.callback ) , onError );
    }
    /**
     * Deleta um arquivo.
     * 
     * @param {object} fileEntry        - arquivo a ser deletado.
     * @param {object} callback         - tratamento para sucesso e erro.
     * @prop  {object} callback.success - realizar chamada em caso de sucesso.
     */
    function df(callback,fileEntry) {
        fileEntry.remove(function() {
            console.log("Successful file deleted");
            if(callback && callback.success ) callback.success(this.result);
        }, onError.bind(this));
    }
}