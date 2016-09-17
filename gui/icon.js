/**
 *  @author		Ondrej Benda
 *  @date		2011-2016
 *  @copyright	GNU GPLv3
 *	@brief		Generic <img>-based HTML icon
 */
function icon(picture, frame) {
    this.img = document.createElement("img");
    this.img.setAttribute("src", "_png/ui/" + anigenActual.getIconType() + "/" + picture);
    this.img.setAttribute("height", anigenActual.getIconHeight() + "px");
    if(frame) {
        this.img.setAttribute("class", "button");
    }
}