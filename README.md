# Gnome Shell Snap To Neighbors

This is a simple shell extension to quickly tile your windows in a more ad-hoc
way than most tiling schemes. Instead of making an entire workspace behave like
a Ion-style tiling window manager you can, with a quick keyboard shortcut, snap
a single window to fill the space between neighboring windows. 

![demo image](demo.gif "How it works")

## Installation 

Clone the repository and symlink or copy it to the extensions folder:

``` 
git clone https://github.com/tpyl/gssnaptoneighbors.giti
ln -s ~/gssnaptoneighbors.git ~/.local/share/gnome-shell/extensions/gssnaptoneighbors@tpyl.github.io
```
You then have to enable the extension either through gnome-tweak-tool, or by installing
the extension web plugin and going to https://extensions.gnome.org/local/. 

Notice that the plugin was developed on Ubuntu 17.10, and in metadata.json is only flagged
to work with gnome shell 3.26.2. It will likely work with many other versions as well, but
you may have to add your version to the list. 


## Configuration

There is a single keyboard shortcut you can configure. Probably this should be
linked to dconf, somehow, but I can't be bothered. You can easily edit it in
`schemas/org.gnome.shell.extensions.snaptoneighbors.gschema.xml` and then run
`glib-compile-schemas  .`

There are some additional values you can tweak at the top of `extension.js`, but
the default values should be good, unless you have highly customized visuals on
your desktop.

The default keyboard shortcut is *CTRL+ALT+S*


