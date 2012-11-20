
/* --- Some enhancements  --------------------------------------------------- */

// http://www.xenoveritas.org/blog/xeno/the-correct-way-to-clone-javascript-arrays
// Array.prototype.clone = function(){
//     return this.slice(0);
// }

/* --- Main Editor object --------------------------------------------------- */
function Editor(server,opts) {
    var t = this;
    /* --- Configuration ---------------------------------------------------- */

    // default values for options:
    this.options={
	target: "editor"
    }

    // Apply supplied options
    if(opts) for(var o in opts) this.options[o]=opts[o];

    /* --- Creating UI components ------------------------------------------- */
    var main = document.getElementById(this.options.target);
    this.ui = {
        menubar: div_class("menu"),
        tree: div_id("tree"),
        refinements: div_id("refinements"),
        lin: div_id("linearisations")
    };
    with(this.ui) {
	appendChildren(main, [menubar, tree, refinements, lin]);
    }

    /* --- Client state initialisation -------------------------------------- */
    this.server = server;
    this.ast = null;
    this.grammar = null;
    this.languages = [];
    this.local = {}; // local settings which may override grammar

    /* --- Main program, this gets things going ----------------------------- */
    this.menu = new EditorMenu(this);

}

Editor.prototype.get_grammar_constructors=function(callback) {
    var t = this;
    var args = {
        format: "json"
    };
    var cont = function(data){
        t.grammar_constructors = data;
        if (callback) callback();
    };
    var err = function(data){
        alert("Error");
    };
    t.server.browse(args, cont, err);
}

/* --- API for getting and setting state ------------------------------------ */

Editor.prototype.get_ast=function() {
    return this.ast.toString();
}

Editor.prototype.get_startcat=function() {
    return this.local.startcat || this.grammar.startcat;
}

/* --- These get called from EditorMenu, or some custom code                  */

Editor.prototype.change_grammar=function(grammar_info) {
    with(this) {
        grammar = grammar_info;
        local.startcat = null;
        get_grammar_constructors(bind(start_fresh,this));
    }
}

Editor.prototype.change_startcat=function(startcat) {
    with(this) {
        local.startcat = startcat;
        start_fresh();
    }
}

// Called after changing grammar or startcat
Editor.prototype.start_fresh=function () {
    with(this) {
        ast = new AST(null, get_startcat());
        redraw_tree();
        update_current_node();
        get_refinements();
        clear(ui.lin);
    }
}

/* --- Functions for handling tree manipulation ----------------------------- */

Editor.prototype.get_refinements=function(cat) {
    var t = this;
    if (cat == undefined)
        cat = t.ast.getCat();
    var args = {
        id: cat,
        format: "json"
    };
    var cont = function(data){
        clear(t.ui.refinements);
        for (pi in data.producers) {
            var opt = span_class("refinement", text(data.producers[pi]));
            opt.onclick = bind(function(){ t.select_refinement(this.innerHTML) }, opt);
            t.ui.refinements.appendChild(opt);
        }
    };
    var err = function(data){
        clear(t.ui.refinements);
        alert("Error");
    };
    t.server.browse(args, cont, err);
}

Editor.prototype.select_refinement=function(fun) {
    with (this) {
        ui.refinements.innerHTML = "...";
        ast.removeChildren();
        ast.setFun(fun);
        var args = {
            id: fun,
            format: "json"
        };
        var err = function(data){
            alert("Error");
        };
        server.browse(args, bind(complete_refinement,this), err);
    }
}

Editor.prototype.complete_refinement=function(data) {
    if (!data) return;

    with (this) {
        // Parse out function arguments
        var def = data.def;
        def = def.substr(def.lastIndexOf(":")+1);
        var fun_args = map(function(s){return s.trim()}, def.split("->"))
        fun_args = fun_args.slice(0,-1);

        if (fun_args.length > 0) {
            // Add placeholders
            for (ci in fun_args) {
                ast.add(null, fun_args[ci]);
            }
        }
        
        // Update ui
        redraw_tree();
        update_linearisation();

        // Select next hole & get its refinements
        ast.toNextHole();
        update_current_node();
    }
}

Editor.prototype.update_current_node=function(newID) {
    with(this) {
        if (newID)
            ast.current = new NodeID(newID);
        redraw_tree();
        get_refinements();
    }
}

Editor.prototype.redraw_tree=function() {
    var t = this;
    var elem = node; // function from support.js
    function visit(container, id, node) {
        var container2 = empty_class("div", "node");
        var label =
            ((node.fun) ? node.fun : "?") + " : " +
            ((node.cat) ? node.cat : "?");
        var current = id.equals(t.ast.current);
        var element = elem("a", {class:(current?"current":"")}, [text(label)]);
        element.onclick = function() {
            t.update_current_node(id);
        }
        container2.appendChild( element );

        for (i in node.children) {
            var newid = new NodeID(id);
            newid.add(parseInt(i));
            visit(container2, newid, node.children[i]);
        }

        container.appendChild(container2);
    }
    with(this) {
        clear(ui.tree);
        visit(ui.tree, new NodeID(), ast.root);
    }
}

Editor.prototype.update_linearisation=function(){

    function langpart(conc,abs) { // langpart("FoodsEng","Foods") == "Eng"
        return hasPrefix(conc,abs) ? conc.substr(abs.length) : conc;
    }

    var t = this;
    with (this) {
        var args = {
            tree: ast.toString()
        };
        server.linearize(args, function(data){
            clear(t.ui.lin);
            for (i in data) {
                var lang = data[i].to;
                var langname = langpart(lang, t.grammar.name);
                if (t.languages.length < 1 || elem(lang, t.languages)) {
                    var div_lang = empty("div");
                    div_lang.appendChild(span_class("lang", text(langname)));
                    div_lang.appendChild(
                        span_class("lin", [text(data[i].text)])
                    );
                    t.ui.lin.appendChild(div_lang);
                }
            }
        });
    }
}

// 
Editor.prototype.delete_refinement = function() {
    var t = this;
    t.ast.removeChildren();
    t.ast.setFun(null);
    t.redraw_tree();
//    t.get_refinements();
}

// Generate random subtree from current node
Editor.prototype.generate_random = function() {
    var t = this;
    t.ui.refinements.innerHTML = "...";
    t.ast.removeChildren();
    var args = {
        cat: t.ast.getCat(),
        limit: 1
    };
    if (!args.cat) {
        alert("Missing category at current node");
        return;
    }
    var cont = function(data){
        var tree = data[0].tree;
        t.import_ast(tree);
    };
    var err = function(data){
        alert("Error");
    };
    server.get_random(args, cont, err);
}

// Import AST from string representation
Editor.prototype.import_ast = function(abstr) {
    var t = this;
    var args = {
        tree: abstr
    };
    var cont = function(tree){
        // Build tree of just fun, then populate with cats
        t.ast.setSubtree(tree);
        t.ast.traverse(function(node){
            var info = t.lookup_fun(node.fun);
            node.cat = info.cat;
        });
        t.redraw_tree();
        t.update_linearisation();
    };
    server.pgf_call("abstrjson", args, cont);
}

// Look up information for a function, hopefully from cache
Editor.prototype.lookup_fun = function(fun) {
    var t = this;
    var def = t.grammar_constructors.funs[fun].def;
    var ix = def.lastIndexOf(" ");
    var cat = def.substr(ix).trim();
    return {
        cat: cat
    }
}

