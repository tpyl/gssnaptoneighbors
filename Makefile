SOURCES=convenience.js \
		extension.js \
		metadata.json 
EXTRAS=LICENSE \
	   README.md 

SCHEMASRC=schemas/org.gnome.shell.extensions.snaptoneighbors.gschema.xml

zip: $(SOURCES) schemas/gschemas.compiled $(EXTRAS)
	zip gssnaptoneighbors.zip $(SOURCES) $(SCHEMASRC) schemas/gschemas.compiled $(EXTRAS)

schemas/gschemas.compiled: $(SCHEMASRC)
	glib-compile-schemas  schemas/



