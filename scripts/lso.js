function decodeLSO(s){
	var x = new a3d.ByteArray(s, a3d.Endian.BIG)
	var version = x.readString(2)
	if(version != '\x00\xbf') throw {}
	var h_len = x.readUInt32()
	// do stuff
	var signature = x.readString(10)
	if(signature != 'TCSO\x00\x04\x00\x00\x00\x00') throw {}
	var root_name = x.readUTF();
	if(x.readString(3) != '\x00\x00\x00') throw {}
	var a_version = x.readUnsignedByte()
	x.objectEncoding = a_version;
	var val = {};
	while(x.pos < x.length){
		name = a_version ? x.readStringAMF3() : x.readUTF()
		value = x.readObject()
		val[name] = value;
		if(x.readUnsignedByte() != 0) throw {}
	}
	return val;
}