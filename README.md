# Gnome Shell Snap To Neighbors

This is a simple shell extension to quickly tile your windows in a more ad-hoc
way than most tiling schemes. Instead of making an entire workspace behave like
a Ion-style tiling window manager you can, with a quick keyboard shortcut, snap
a single window to fill the space between neighboring windows. 

## Installation 

Clone the repository and symlink or copy it to the extensions folder:

``` 
git clone https://github.com/tpyl/gssnaptoneighbors.git ln -s gssnaptoneighbors.git
~/.local/share/gnome-shell/extensions/gssnaptoneighbors@tpyl.github.io
```

## Configuration

There is a single keyboard shortcut you can configure. Probably this should be
linked to dconf, somehow, but I can't be bothered. You can easily edit it in
`schemas/org.gnome.shell.extensions.snaptoneighbors.gschema.xml` and then run
`glib-compile-schemas  .`

There are some additional values you can tweak at the top of `extension.js`, but
the default values should be good, unless you have highly customized visuals on
your desktop.

