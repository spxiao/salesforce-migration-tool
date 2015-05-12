$(document).ready(function() {

  $("#submitBtn").click(function() {
    if (userId == null) {
      // new
      $("#inputMethod").val("post");
      $.post('/admin/organization/' + orgId + "/user", $("form").serialize(), function(result) {
        if (result.success) {
          window.location.href = "/admin/organization/" + orgId;
        } else {
          alert("create failed");
        }
      });
    } else {
      // edit
      $("#inputMethod").val("put");
      $.post('/admin/organization/' + orgId + "/user/" + userId, $("form").serialize(), function(result) {
        if (result.success) {
          window.location.href = "/admin/organization/" + orgId + "/user/" + userId;
        } else {
          alert("update failed");
        }
      });
    }
  });

  $("#cancelBtn").click(function() {
    if (orgId == null) {
      // new
      window.location.href = "/admin/organization/" + orgId;
    } else {
      // edit
      window.location.href = "/admin/organization/" + orgId + "/user/" + userId;
    }
  });

});